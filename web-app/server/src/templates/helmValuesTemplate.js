import { stringify } from "yaml";

export function renderHelmValues(bot, env) {
  return stringify({
    chartSource: env.hologramChart,
    chartVersion: env.hologramChartVersion,
    global: {
      domain: "eafit.testnet.verana.network"
    },
    nameOverride: `${bot.slug}-chart`,
    credentialDefinitionId: env.credentialDefinitionId,
    chatbot: {
      replicas: 1,
      env: [
        { name: "APP_PORT", value: "3003" },
        { name: "LOG_LEVEL", value: "3" },
        { name: "LLM_PROVIDER", value: "openai" },
        { name: "OPENAI_MODEL", value: env.openAiModel },
        { name: "OPENAI_BASE_URL", value: env.openAiBaseUrl },
        { name: "CREDENTIAL_DEFINITION_ID", value: env.credentialDefinitionId },
        { name: "MCP_CONFIG_ENCRYPTION_KEY", value: env.mcpConfigEncryptionKey }
      ],
      secret: {
        OPENAI_API_KEY: env.openAiApiKey,
        POSTGRES_PASSWORD: "replace-me",
        POSTGRES_USER: `${bot.slug}_db`,
        POSTGRES_DB_NAME: bot.slug
      },
      service: {
        type: "ClusterIP",
        port: 3003
      },
      ingress: {
        enabled: true,
        host: `${bot.slug}.${env.baseDomain}`
      },
      agentPack: {
        enabled: true,
        name: bot.slug,
        mountPath: `/app/agent-packs/${bot.slug}`,
        fileName: "agent-pack.yaml",
        existingConfigMap: `${bot.slug}-agent-pack`
      }
    },
    redis: {
      enabled: true
    },
    postgres: {
      enabled: true,
      secret: {
        POSTGRES_PASSWORD: "replace-me",
        POSTGRES_USER: `${bot.slug}_db`,
        POSTGRES_DB: bot.slug
      }
    },
    "vs-agent-chart": {
      enabled: true,
      name: bot.slug,
      didcommLabel: bot.name,
      didcommInvitationImageUrl: env.serviceLogoUrl,
      eventsBaseUrl: `http://${bot.slug}-chart-chatbot:3003`,
      ingress: {
        host: `${bot.slug}.${env.baseDomain}`,
        tlsSecret: `${bot.slug}.eafit.testnet.verana.network-cert`,
        public: {
          enableCors: true
        }
      },
      extraEnv: [
        { name: "AGENT_WALLET_ID", value: bot.name },
        { name: "SELF_ISSUED_VTC_SERVICE_DESCRIPTION", value: bot.serviceDescription },
        { name: "SELF_ISSUED_VTC_SERVICE_TYPE", value: "AI Agent" }
      ]
    }
  });
}
