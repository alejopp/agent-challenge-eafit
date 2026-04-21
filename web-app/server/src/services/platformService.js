import { env } from "../lib/env.js";

export const mcpCatalog = [
  {
    id: "weather",
    name: "Weather Planner",
    description: "Check live weather conditions and recommend whether an outdoor visit is viable.",
    endpoint: `${env.backendPublicUrl}/mcp/weather`
  },
  {
    id: "wikipedia",
    name: "Wikipedia Research",
    description: "Search and summarize Wikipedia content so service agents can answer general knowledge questions.",
    endpoint: `${env.backendPublicUrl}/mcp/wikipedia`
  }
];

export function getPlatformConfig() {
  return {
    teamName: env.teamName,
    baseDomain: env.baseDomain,
    mcpServers: mcpCatalog
  };
}
