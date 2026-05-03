import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';

function slugify(input) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function buildMcpServers(bot, config) {
  return bot.mcpServices.map((serviceId) => ({
    name: serviceId,
    transport: 'streamable-http',
    url: `${(config.mcpInternalBaseUrl || config.mcpPublicBaseUrl).replace(/\/$/, '')}/api/mcp/${serviceId}`
  }));
}

function buildAgentPack(bot, config) {
  const botDatabaseName = getBotDatabaseName(bot);
  return {
    metadata: {
      id: bot.slug,
      displayName: bot.personaName,
      description: bot.personaDescription,
      defaultLanguage: 'es',
      tags: ['persona-ai', bot.serviceCategory, 'team-g']
    },
    languages: {
      es: {
        greetingMessage: `Hola, soy ${bot.personaName}, tu asistente para ${bot.serviceName}.`,
        systemPrompt: bot.prompt,
        strings: {
          ROOT_TITLE: bot.serviceName,
          LOGOUT: 'Cerrar sesión',
          CREDENTIAL: 'Autenticar',
          WELCOME: `Bienvenido. Soy ${bot.personaName} y te ayudaré con ${bot.serviceName}.`,
          AUTH_REQUIRED: 'Debes autenticarte para continuar.',
          AUTH_SUCCESS: 'Autenticación completada con éxito.'
        }
      }
    },
    llm: {
      provider: 'openai',
      model: config.openaiModel,
      temperature: 0.4,
      agentPrompt: bot.prompt
    },
    rag: bot.ragFiles.length
      ? {
          provider: 'langchain',
          docsPath: '/app/rag/docs',
          vectorStore: {
            type: 'redis',
            indexName: bot.slug.replace(/-/g, '_')
          }
        }
      : undefined,
    memory: {
      backend: 'redis',
      window: 20,
      redisUrl: config.sharedRedisUrl
    },
    flows: {
      welcome: {
        enabled: true,
        sendOnProfile: true,
        templateKey: 'greetingMessage'
      },
      authentication: {
        enabled: true,
        credentialDefinitionId: config.credentialDefinitionId,
        adminAvatars: []
      },
      menu: {
        items: [
          { id: 'authenticate', labelKey: 'CREDENTIAL', action: 'authenticate' },
          { id: 'logout', labelKey: 'LOGOUT', action: 'logout' }
        ]
      }
    },
    mcp: {
      servers: buildMcpServers(bot, config)
    },
    integrations: {
      vsAgent: {
        adminUrl: `http://${bot.releaseName}.${config.k8sNamespace}:3000`
      },
      postgres: {
        host: getBotPostgresHost(bot, config),
        user: botDatabaseName,
        password: config.sharedPostgresPassword,
        dbName: botDatabaseName,
        schema: 'public'
      }
    }
  };
}

function buildHelmValues(bot, config) {
  const botDatabaseName = getBotDatabaseName(bot);
  const botPostgresHost = getBotPostgresHost(bot, config);
  const botRedisHost = getBotRedisHost(bot, config);
  const botVsAgentAdminUrl = getBotVsAgentAdminUrl(bot, config);
  const isTestnet = config.baseAgentDomain.includes('testnet') || config.baseAgentDomain.includes('localhost');

  return {
    chartSource: config.helmChartSource,
    chartVersion: config.helmChartVersion,
    global: {
      domain: 'eafit.testnet.verana.network'
    },
    nameOverride: bot.releaseName,
    credentialDefinitionId: config.credentialDefinitionId,
    redis: {
      enabled: false
    },
    postgres: {
      enabled: false
    },
    chatbot: {
      replicas: 1,
      env: [
        ...(isTestnet ? [{ name: 'NODE_TLS_REJECT_UNAUTHORIZED', value: '0' }] : []),
        { name: 'APP_PORT', value: '3003' },
        { name: 'LOG_LEVEL', value: '3' },
        { name: 'LLM_PROVIDER', value: 'openai' },
        { name: 'OPENAI_MODEL', value: config.openaiModel },
        { name: 'EMBEDDINGS_PROVIDER', value: 'openai' },
        { name: 'EMBEDDINGS_MODEL', value: config.openaiModel },
        { name: 'VECTOR_STORE', value: 'redis' },
        { name: 'VECTOR_INDEX_NAME', value: bot.slug.replace(/-/g, '_') },
        { name: 'AGENT_MEMORY_BACKEND', value: 'redis' },
        { name: 'AGENT_MEMORY_WINDOW', value: '20' },
        { name: 'REDIS_URL', value: `redis://${botRedisHost}:6379` },
        { name: 'VS_AGENT_ADMIN_URL', value: botVsAgentAdminUrl },
        { name: 'POSTGRES_HOST', value: botPostgresHost },
        { name: 'POSTGRES_PORT', value: '5432' },
        { name: 'CREDENTIAL_DEFINITION_ID', value: config.credentialDefinitionId }
      ],
      agentPack: {
        enabled: true,
        name: bot.slug,
        mountPath: `/app/agent-packs/${bot.slug}`,
        fileName: 'agent-pack.yaml',
        existingConfigMap: `${bot.releaseName}-agent-pack`
      },
      ingress: {
        enabled: false
      },
      secret: {
        POSTGRES_PASSWORD: config.sharedPostgresPassword,
        POSTGRES_USER: botDatabaseName,
        POSTGRES_DB_NAME: botDatabaseName
      }
    },
    stats: {
      enabled: false
    },
    'vs-agent-chart': {
      enabled: true,
      name: bot.releaseName,
      didcommLabel: bot.personaName,
      eventsBaseUrl: `http://${bot.releaseName}-chatbot:3003`,
      database: {
        enabled: false,
        host: botPostgresHost,
        user: botDatabaseName,
        pwd: config.sharedPostgresPassword
      },
      extraEnv: [
        ...(isTestnet ? [{ name: 'NODE_TLS_REJECT_UNAUTHORIZED', value: '0' }] : []),
        { name: 'AGENT_WALLET_ID', value: bot.personaName },
        { name: 'SERVICE_NAME', value: bot.serviceName || bot.personaName },
        { name: 'SERVICE_DESCRIPTION', value: bot.serviceDescription || '' },
        { name: 'SERVICE_LOGO_URL', value: bot.personaPhotoPath ? `${config.appUrl}${bot.personaPhotoPath}` : '' },
        { name: 'AGENT_PUBLIC_URL', value: bot.publicUrl },
        { name: 'USE_CORS', value: 'true' },
        { name: 'AGENT_LOG_LEVEL', value: '3' },
        { name: 'ANONCREDS_SERVICE_BASE_URL', value: `https://${config.veranaOrgPublicUrl || 'organization.eafit.testnet.verana.network'}` },
        { name: 'REDIRECT_DEFAULT_URL_TO_INVITATION_URL', value: 'true' },
        { name: 'POSTGRES_HOST', value: botPostgresHost },
        { name: 'POSTGRES_PORT', value: '5432' },
        { name: 'POSTGRES_USER', value: botDatabaseName },
        { name: 'POSTGRES_PASSWORD', value: config.sharedPostgresPassword },
        { name: 'POSTGRES_DB', value: botDatabaseName },
        { name: 'POSTGRES_DB_NAME', value: botDatabaseName },
        { name: 'POSTGRES_DATABASE', value: botDatabaseName },
        { name: 'REDIS_HOST', value: botRedisHost }
      ],
      ingress: {
        host: `${bot.slug}.${config.baseAgentDomain}`,
        tlsSecret: config.baseAgentTlsSecret
      }
    }
  };
}

function getBotDatabaseName(bot) {
  return bot.slug.replace(/-/g, '_').slice(0, 63);
}

function getBotPostgresHost(bot, config) {
  return config.sharedPostgresHost;
}

function getBotRedisHost(bot, config) {
  // Parse the host from the shared Redis URL
  try {
    const url = new URL(config.sharedRedisUrl);
    return url.hostname;
  } catch (e) {
    return 'redis-master.team-g.svc.cluster.local';
  }
}

function getBotVsAgentAdminUrl(bot, config) {
  return `http://${bot.releaseName}.${config.k8sNamespace}:3000`;
}

function validateSharedInfrastructure(config) {
  const required = [
    ['SHARED_POSTGRES_PASSWORD', config.sharedPostgresPassword],
    ['SHARED_POSTGRES_USER', config.sharedPostgresUser],
    ['OLLAMA_BASE_URL', config.ollamaBaseUrl],
    ['OLLAMA_MODEL', config.ollamaModel],
    ['MCP_PUBLIC_BASE_URL', config.mcpPublicBaseUrl]
  ];

  const missing = required.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Missing shared infrastructure configuration: ${missing.join(', ')}`);
  }
}

function writeBotAssets(bot, config) {
  const botDir = path.join(config.rootDir, 'generated', bot.slug);
  fs.mkdirSync(botDir, { recursive: true });

  const botDatabaseName = getBotDatabaseName(bot);
  const agentPack = YAML.stringify(buildAgentPack(bot, config));
  const helmValues = YAML.stringify(buildHelmValues(bot, config));

  const dbSetupJob = YAML.stringify({
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: `${bot.releaseName}-db-setup`,
      namespace: config.k8sNamespace
    },
    spec: {
      backoffLimit: 3,
      template: {
        spec: {
          restartPolicy: 'Never',
          containers: [
            {
              name: 'db-setup',
              image: 'postgres:16-alpine',
              env: [
                { name: 'PGHOST', value: config.sharedPostgresHost },
                { name: 'PGPORT', value: String(config.sharedPostgresPort || 5432) },
                { name: 'PGUSER', value: config.sharedPostgresUser },
                { name: 'PGPASSWORD', value: config.sharedPostgresPassword }
              ],
              command: ['/bin/sh', '-c'],
              args: [
                `psql -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_roles WHERE rolname='${botDatabaseName}'" | grep -q 1 || psql -v ON_ERROR_STOP=1 -c "CREATE USER \\"${botDatabaseName}\\" WITH PASSWORD '${config.sharedPostgresPassword}' CREATEDB;"\npsql -v ON_ERROR_STOP=1 -c "ALTER USER \\"${botDatabaseName}\\" CREATEDB;"\npsql -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_database WHERE datname = '${botDatabaseName}'" | grep -q 1 || psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE \\"${botDatabaseName}\\" OWNER \\"${botDatabaseName}\\";"`
              ]
            }
          ]
        }
      }
    }
  });

  fs.writeFileSync(path.join(botDir, 'agent-pack.yaml'), agentPack);
  fs.writeFileSync(path.join(botDir, 'values.generated.yaml'), helmValues);
  fs.writeFileSync(path.join(botDir, 'db-setup-job.yaml'), dbSetupJob);
  fs.writeFileSync(
    path.join(botDir, 'release.json'),
    JSON.stringify(
      {
        releaseName: bot.releaseName,
        publicUrl: bot.publicUrl,
        namespace: config.k8sNamespace,
        chartSource: config.helmChartSource,
        chartVersion: config.helmChartVersion
      },
      null,
      2
    )
  );

  return { botDir, agentPack, helmValues };
}

function runHelm(action, bot, config, botDir) {
  const helmEnv = {
    ...process.env,
    KUBECONFIG: config.kubeconfigPath
  };

  if (action === 'publish') {
    validateSharedInfrastructure(config);

    const dbJobFile = path.join(botDir, 'db-setup-job.yaml');
    
    // Create/update the database setup job
    const jobResult = spawnSync(
      'kubectl',
      ['apply', '-f', dbJobFile, '--namespace', config.k8sNamespace],
      { env: helmEnv, encoding: 'utf-8' }
    );
    if (jobResult.status !== 0) {
      console.error('Failed to apply db-setup job:', jobResult.stderr || jobResult.stdout);
      return jobResult;
    }

    // Wait for the database setup to complete
    const jobWaitResult = spawnSync(
      'kubectl',
      [
        'wait',
        '--for=condition=complete',
        `job/${bot.releaseName}-db-setup`,
        '--namespace',
        config.k8sNamespace,
        '--timeout=120s'
      ],
      { env: helmEnv, encoding: 'utf-8' }
    );
    if (jobWaitResult.status !== 0) {
      console.error('Failed waiting for db-setup job to complete:', jobWaitResult.stderr || jobWaitResult.stdout);
      return jobWaitResult;
    }

    // Clean up job so it doesn't block future upgrades
    spawnSync(
      'kubectl',
      ['delete', 'job', `${bot.releaseName}-db-setup`, '--namespace', config.k8sNamespace, '--ignore-not-found'],
      { env: helmEnv, encoding: 'utf-8' }
    );

    const valuesFile = path.join(botDir, 'values.generated.yaml');
    const configMapName = `${bot.releaseName}-agent-pack`;

    const configMapResult = spawnSync(
      'kubectl',
      [
        'create',
        'configmap',
        configMapName,
        '--namespace',
        config.k8sNamespace,
        '--from-file',
        `agent-pack.yaml=${path.join(botDir, 'agent-pack.yaml')}`,
        '--dry-run=client',
        '-o',
        'yaml'
      ],
      { env: helmEnv, encoding: 'utf-8' }
    );

    if (configMapResult.status !== 0) {
      return configMapResult;
    }

    const applyResult = spawnSync('kubectl', ['apply', '-f', '-'], {
      env: helmEnv,
      input: configMapResult.stdout,
      encoding: 'utf-8'
    });

    if (applyResult.status !== 0) {
      return applyResult;
    }

    const result = spawnSync(
      'helm',
      [
        'upgrade',
        '--install',
        bot.releaseName,
        config.helmChartSource,
        '--version',
        config.helmChartVersion,
        '--namespace',
        config.k8sNamespace,
        '--values',
        valuesFile
      ],
      { env: helmEnv, encoding: 'utf-8' }
    );

    return result;
  }

  return spawnSync(
    'helm',
    ['uninstall', bot.releaseName, '--namespace', config.k8sNamespace],
    { env: helmEnv, encoding: 'utf-8' }
  );
}

export function prepareBotForPersistence(input, config, existingBot = {}) {
  const slug = slugify(input.personaName || existingBot.personaName || 'persona-bot');
  return {
    ...existingBot,
    ...input,
    slug,
    publicUrl: `https://${slug}.${config.baseAgentDomain}`,
    releaseName: `${config.helmReleasePrefix}-${slug}`.slice(0, 53)
  };
}

export function publishBot(bot, config) {
  const { botDir } = writeBotAssets(bot, config);

  if (!config.enableHelmDeploy) {
    return {
      success: true,
      notes:
        'Bot assets generated successfully. Helm execution is disabled in this environment, so this was saved as a dry run.'
    };
  }

  const result = runHelm('publish', bot, config, botDir);
  return {
    success: result.status === 0,
    notes: result.status === 0 ? result.stdout : result.stderr || result.stdout
  };
}

export function unpublishBot(bot, config) {
  if (!config.enableHelmDeploy) {
    return {
      success: true,
      notes: 'Helm execution is disabled in this environment. The bot was marked as unpublished locally.'
    };
  }

  const result = runHelm('unpublish', bot, config);
  return {
    success: result.status === 0,
    notes: result.status === 0 ? result.stdout : result.stderr || result.stdout
  };
}
