import path from 'node:path';

const rootDir = path.resolve(process.cwd());

export const config = {
  rootDir,
  port: Number(process.env.PORT || 4000),
  host: process.env.HOST || '127.0.0.1',
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  clientDevUrl: process.env.CLIENT_DEV_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  databasePath: path.resolve(rootDir, process.env.DATABASE_PATH || './data/persona-ai.sqlite'),
  storageDir: path.resolve(rootDir, process.env.STORAGE_DIR || './data'),
  kubeconfigPath: process.env.KUBECONFIG_PATH || './secrets/team-g-kubeconfig.yaml',
  k8sNamespace: process.env.K8S_NAMESPACE || 'team-g',
  baseAgentDomain: process.env.BASE_AGENT_DOMAIN || 'team-g.teams.eafit.testnet.verana.network',
  baseAgentTlsSecret:
    process.env.BASE_AGENT_TLS_SECRET || 'team-g.teams.eafit.testnet.verana.network-cert',
  helmReleasePrefix: process.env.HELM_RELEASE_PREFIX || 'persona',
  helmChartSource:
    process.env.HELM_CHART_SOURCE ||
    './helm/hologram-generic-ai-agent-chart',
  helmChartVersion: process.env.HELM_CHART_VERSION || 'v1.11.2',
  enableHelmDeploy: process.env.ENABLE_HELM_DEPLOY === 'true',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  sharedRedisUrl:
    process.env.SHARED_REDIS_URL || 'redis://redis-master.team-g.svc.cluster.local:6379',
  sharedPostgresHost: process.env.SHARED_POSTGRES_HOST || 'postgres.team-g.svc.cluster.local',
  sharedPostgresPort: Number(process.env.SHARED_POSTGRES_PORT || 5432),
  sharedPostgresUser: process.env.SHARED_POSTGRES_USER || 'persona_agents',
  sharedPostgresPassword: process.env.SHARED_POSTGRES_PASSWORD || 'change-me',
  sharedPostgresDatabase: process.env.SHARED_POSTGRES_DATABASE || 'persona_agents',
  sharedPostgresSchemaPrefix: process.env.SHARED_POSTGRES_SCHEMA_PREFIX || 'persona_bot',
  veranaOrgPublicUrl:
    process.env.VERANA_ORG_VS_PUBLIC_URL || 'https://organization.eafit.testnet.verana.network',
  veranaOrgAdminUrl:
    process.env.VERANA_ORG_VS_ADMIN_URL ||
    'https://admin.organization.eafit.testnet.verana.network',
  credentialDefinitionId:
    process.env.VERANA_CREDENTIAL_DEFINITION_ID ||
    'did:webvh:QmPZBrmehNXxY4eRL2a9F52sCfkQfToPHM8R427sNS2F1N:avatar.eafit.testnet.verana.network/resources/zQmdzYfqKe6ypc9NbRMHbCFvgnrqCwbWjBK2odKYrRePaTu',
  mcpPublicBaseUrl: process.env.MCP_PUBLIC_BASE_URL || process.env.APP_URL || 'http://localhost:4000',
  mcpInternalBaseUrl:
    process.env.MCP_INTERNAL_BASE_URL ||
    `http://persona-ai-creator.${process.env.K8S_NAMESPACE || 'team-g'}.svc.cluster.local`,
  llmProvider: process.env.LLM_PROVIDER || 'openai'
};
