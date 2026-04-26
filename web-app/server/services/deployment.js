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
    url: `${config.mcpPublicBaseUrl.replace(/\/$/, '')}/api/mcp/${serviceId}`
  }));
}

function buildAgentPack(bot, config) {
  const schemaName = getSchemaName(bot, config);
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
      provider: config.llmProvider,
      model: config.ollamaModel,
      baseUrl: config.ollamaBaseUrl,
      temperature: 0.4,
      agentPrompt: bot.prompt
    },
    rag: bot.ragFiles.length
      ? {
          provider: 'langchain',
          docsPath: '/app/rag/docs'
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
        host: config.sharedPostgresHost,
        user: config.sharedPostgresUser,
        password: config.sharedPostgresPassword,
        dbName: config.sharedPostgresDatabase,
        schema: schemaName
      }
    }
  };
}

function buildHelmValues(bot, config) {
  const schemaName = getSchemaName(bot, config);
  const redisHost = getRedisHost(config.sharedRedisUrl);
  const pgOptions = `-c search_path=${schemaName},public`;
  const openAiCompatApiKey = 'ollama-local-placeholder';

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
        { name: 'APP_PORT', value: '3003' },
        { name: 'LOG_LEVEL', value: '3' },
        // The chatbot image expects an OpenAI-compatible API, so we route it to Ollama's v1 endpoint.
        { name: 'LLM_PROVIDER', value: 'openai' },
        { name: 'OPENAI_MODEL', value: config.ollamaModel },
        { name: 'OPENAI_BASE_URL', value: config.ollamaBaseUrl },
        { name: 'EMBEDDINGS_PROVIDER', value: 'openai' },
        { name: 'EMBEDDINGS_MODEL', value: config.ollamaModel },
        { name: 'VECTOR_STORE', value: 'redis' },
        { name: 'VECTOR_INDEX_NAME', value: bot.slug.replace(/-/g, '_') },
        { name: 'AGENT_MEMORY_BACKEND', value: 'redis' },
        { name: 'AGENT_MEMORY_WINDOW', value: '20' },
        { name: 'REDIS_URL', value: config.sharedRedisUrl },
        { name: 'POSTGRES_HOST', value: config.sharedPostgresHost },
        { name: 'POSTGRES_PORT', value: String(config.sharedPostgresPort) },
        { name: 'POSTGRES_SCHEMA', value: schemaName },
        { name: 'TYPEORM_SCHEMA', value: schemaName },
        { name: 'DATABASE_SCHEMA', value: schemaName },
        { name: 'PGOPTIONS', value: pgOptions },
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
        OPENAI_API_KEY: openAiCompatApiKey,
        POSTGRES_PASSWORD: config.sharedPostgresPassword,
        POSTGRES_USER: config.sharedPostgresUser,
        POSTGRES_DB_NAME: config.sharedPostgresDatabase
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
        host: config.sharedPostgresHost,
        user: config.sharedPostgresUser,
        pwd: config.sharedPostgresPassword
      },
      extraEnv: [
        { name: 'AGENT_WALLET_ID', value: bot.personaName },
        { name: 'USE_CORS', value: 'true' },
        { name: 'AGENT_LOG_LEVEL', value: '3' },
        { name: 'ANONCREDS_SERVICE_BASE_URL', value: 'https://chatbot.dev.2060.io' },
        { name: 'REDIRECT_DEFAULT_URL_TO_INVITATION_URL', value: 'true' },
        { name: 'POSTGRES_HOST', value: config.sharedPostgresHost },
        { name: 'POSTGRES_PORT', value: String(config.sharedPostgresPort) },
        { name: 'POSTGRES_USER', value: config.sharedPostgresUser },
        { name: 'POSTGRES_PASSWORD', value: config.sharedPostgresPassword },
        { name: 'POSTGRES_DB', value: config.sharedPostgresDatabase },
        { name: 'POSTGRES_DB_NAME', value: config.sharedPostgresDatabase },
        { name: 'POSTGRES_DATABASE', value: config.sharedPostgresDatabase },
        { name: 'POSTGRES_SCHEMA', value: schemaName },
        { name: 'PGOPTIONS', value: pgOptions },
        { name: 'REDIS_HOST', value: redisHost }
      ],
      ingress: {
        host: `${bot.slug}.${config.baseAgentDomain}`,
        tlsSecret: config.baseAgentTlsSecret
      }
    }
  };
}

function getSchemaName(bot, config) {
  const suffix = bot.slug.replace(/-/g, '_');
  return `${config.sharedPostgresSchemaPrefix}_${suffix}`.slice(0, 63);
}

function getRedisHost(redisUrl) {
  try {
    return new URL(redisUrl).hostname;
  } catch {
    return 'redis-master.team-g.svc.cluster.local';
  }
}

function validateSharedInfrastructure(config) {
  const required = [
    ['SHARED_POSTGRES_HOST', config.sharedPostgresHost],
    ['SHARED_POSTGRES_USER', config.sharedPostgresUser],
    ['SHARED_POSTGRES_PASSWORD', config.sharedPostgresPassword],
    ['SHARED_POSTGRES_DATABASE', config.sharedPostgresDatabase],
    ['SHARED_REDIS_URL', config.sharedRedisUrl],
    ['OLLAMA_BASE_URL', config.ollamaBaseUrl],
    ['OLLAMA_MODEL', config.ollamaModel],
    ['MCP_PUBLIC_BASE_URL', config.mcpPublicBaseUrl]
  ];

  const missing = required.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Missing shared infrastructure configuration: ${missing.join(', ')}`);
  }
}

function ensureSharedPostgresSchema(bot, config) {
  const schemaName = getSchemaName(bot, config);
  const env = {
    ...process.env,
    PGPASSWORD: config.sharedPostgresPassword
  };

  const sql = [
    `CREATE SCHEMA IF NOT EXISTS "${schemaName}";`,
    `GRANT USAGE ON SCHEMA "${schemaName}" TO ${config.sharedPostgresUser};`,
    `GRANT CREATE ON SCHEMA "${schemaName}" TO ${config.sharedPostgresUser};`,
    `ALTER ROLE ${config.sharedPostgresUser} IN DATABASE ${config.sharedPostgresDatabase} SET search_path TO "${schemaName}", public;`
  ].join(' ');

  const result = spawnSync(
    'psql',
    [
      '-v',
      'ON_ERROR_STOP=1',
      '-h',
      config.sharedPostgresHost,
      '-p',
      String(config.sharedPostgresPort),
      '-U',
      config.sharedPostgresUser,
      '-d',
      config.sharedPostgresDatabase,
      '-c',
      sql
    ],
    { env, encoding: 'utf-8' }
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Shared Postgres schema bootstrap failed.');
  }
}

function writeBotAssets(bot, config) {
  const botDir = path.join(config.rootDir, 'generated', bot.slug);
  fs.mkdirSync(botDir, { recursive: true });

  const agentPack = YAML.stringify(buildAgentPack(bot, config));
  const helmValues = YAML.stringify(buildHelmValues(bot, config));

  fs.writeFileSync(path.join(botDir, 'agent-pack.yaml'), agentPack);
  fs.writeFileSync(path.join(botDir, 'values.generated.yaml'), helmValues);
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
    ensureSharedPostgresSchema(bot, config);

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
        '--create-namespace',
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
