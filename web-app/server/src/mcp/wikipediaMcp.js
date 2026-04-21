async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "persona-ai-studio"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function searchWikipedia(query) {
  const searchParams = new URLSearchParams({
    action: "query",
    list: "search",
    format: "json",
    srsearch: query,
    srlimit: "5",
    origin: "*"
  });

  const response = await getJson(`https://en.wikipedia.org/w/api.php?${searchParams.toString()}`);
  return response.query?.search?.map((item) => ({
    title: item.title,
    snippet: item.snippet.replace(/<[^>]+>/g, ""),
    pageId: item.pageid
  }));
}

async function wikipediaSummary(title) {
  return getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
}

export async function handleWikipediaMcp(message) {
  if (message.method === "initialize") {
    return {
      protocolVersion: "2024-11-05",
      serverInfo: {
        name: "wikipedia-research-mcp",
        version: "1.0.0"
      },
      capabilities: {
        tools: {}
      }
    };
  }

  if (message.method === "tools/list") {
    return {
      tools: [
        {
          name: "search_wikipedia",
          description: "Search Wikipedia pages for a topic.",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string" }
            },
            required: ["query"]
          }
        },
        {
          name: "read_wikipedia_summary",
          description: "Read a short summary for a Wikipedia page title.",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" }
            },
            required: ["title"]
          }
        }
      ]
    };
  }

  if (message.method === "tools/call") {
    const tool = message.params?.name;
    const args = message.params?.arguments || {};
    const result = tool === "search_wikipedia" ? await searchWikipedia(args.query) : await wikipediaSummary(args.title);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unsupported MCP method: ${message.method}`);
}
