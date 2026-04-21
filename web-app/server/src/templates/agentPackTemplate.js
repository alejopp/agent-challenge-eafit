import { stringify } from "yaml";
import { mcpCatalog } from "../services/platformService.js";

export function renderAgentPack(bot, env) {
  const selectedMcp = mcpCatalog
    .filter((server) => bot.mcpServers.includes(server.id))
    .map((server) => ({
      name: server.id,
      transport: "streamable-http",
      url: server.endpoint,
      accessMode: "public",
      toolAccess: {
        default: "public"
      }
    }));

  const documentUrls = bot.ragDocuments.map((document) => `${env.backendPublicUrl}${document.url}`);

  return stringify({
    metadata: {
      id: bot.slug,
      displayName: bot.name,
      description: bot.serviceDescription,
      defaultLanguage: "en",
      tags: ["persona-ai", env.teamName, bot.serviceCategory]
    },
    languages: {
      en: {
        greetingMessage: `Hi, I'm ${bot.name}. I help clients with ${bot.serviceName}.`,
        systemPrompt: bot.prompt,
        strings: {
          ROOT_TITLE: bot.name,
          WELCOME: bot.serviceDescription,
          LOGOUT: "Logout",
          CREDENTIAL: "Authenticate"
        }
      }
    },
    llm: {
      provider: "openai",
      model: env.openAiModel,
      baseUrl: env.openAiBaseUrl,
      temperature: 0.4,
      agentPrompt: bot.prompt
    },
    rag: documentUrls.length
      ? {
          provider: "langchain",
          remoteUrls: documentUrls
        }
      : undefined,
    memory: {
      backend: "redis",
      window: 20
    },
    flows: {
      welcome: {
        enabled: true,
        sendOnProfile: true,
        templateKey: "greetingMessage"
      },
      authentication: {
        enabled: Boolean(env.credentialDefinitionId),
        credentialDefinitionId: env.credentialDefinitionId,
        adminAvatars: []
      }
    },
    mcp: {
      servers: selectedMcp
    },
    integrations: {
      vsAgent: {
        adminUrl: `http://${bot.slug}:3000`
      }
    }
  });
}
