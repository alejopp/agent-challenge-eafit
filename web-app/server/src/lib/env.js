import path from "node:path";

const rootDir = path.resolve(process.cwd());
const resolveLocalPath = (input, fallback) => path.resolve(rootDir, input || fallback);

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  dbPath: resolveLocalPath(process.env.DB_PATH, "./server/data/persona-agents.db"),
  uploadDir: resolveLocalPath(process.env.UPLOAD_DIR, "./server/uploads"),
  generatedDir: resolveLocalPath(process.env.GENERATED_DIR, "./server/generated"),
  teamName: process.env.TEAM_NAME || "team-g",
  baseDomain: process.env.BASE_DOMAIN || "agents.team-g.teams.eafit.testnet.verana.network",
  backendPublicUrl: (process.env.BACKEND_PUBLIC_URL || "http://localhost:4000").replace(/\/$/, ""),
  kubeconfigPath: process.env.KUBECONFIG_PATH || "",
  k8sNamespace: process.env.K8S_NAMESPACE || "eafit-team-g",
  enableK8sApply: process.env.ENABLE_K8S_APPLY === "true",
  helmReleasePrefix: process.env.HELM_RELEASE_PREFIX || "persona-agent",
  hologramChart: process.env.HOLOGRAM_CHART || "oci://registry-1.docker.io/io2060/hologram-generic-ai-agent-chart",
  hologramChartVersion: process.env.HOLOGRAM_CHART_VERSION || "v1.11.2",
  vsAgentImage: process.env.VS_AGENT_IMAGE || "veranalabs/vs-agent:latest",
  chatbotImage: process.env.CHATBOT_IMAGE || "io2060/hologram-generic-ai-agent-app:v1.11.2",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  openAiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  mcpConfigEncryptionKey: process.env.MCP_CONFIG_ENCRYPTION_KEY || "",
  credentialDefinitionId: process.env.CREDENTIAL_DEFINITION_ID || "",
  orgVsPublicUrl: process.env.ORG_VS_PUBLIC_URL || "https://organization.eafit.testnet.verana.network",
  serviceLogoUrl: process.env.SERVICE_LOGO_URL || "https://hologram.zone/images/github.svg"
};
