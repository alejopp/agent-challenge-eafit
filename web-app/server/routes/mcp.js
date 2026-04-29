import { Router } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as z from 'zod/v4';

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'persona-ai-agent-creator'
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function runWeather(location) {
  const geocoding = await fetchJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
  );
  const match = geocoding.results?.[0];

  if (!match) {
    throw new Error('Location not found.');
  }

  const forecast = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m`
  );

  return {
    location: `${match.name}, ${match.country}`,
    current: forecast.current
  };
}

async function runWikipedia(query) {
  const search = await fetchJson(
    `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(query)}&limit=1`
  );
  const title = search.pages?.[0]?.title || query;
  const response = await fetchJson(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  );

  return {
    title: response.title,
    summary: response.extract,
    url: response.content_urls?.desktop?.page || null
  };
}

const MCP_SERVICES = {
  weather: {
    name: 'weather',
    title: 'Weather MCP',
    description: 'Checks forecast conditions for appointments and outdoor services.',
    toolName: 'get_forecast',
    inputSchema: {
      location: z.string().min(1).describe('City or location to forecast')
    },
    handler: async ({ location }) => runWeather(location)
  },
  wikipedia: {
    name: 'wikipedia',
    title: 'Wikipedia MCP',
    description: 'Searches encyclopedia articles to answer general knowledge questions.',
    toolName: 'search_article',
    inputSchema: {
      query: z.string().min(1).describe('Article topic to search')
    },
    handler: async ({ query }) => runWikipedia(query)
  }
};

function createToolResult(result) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
}

function getServiceDefinition(serviceId) {
  return MCP_SERVICES[serviceId] || null;
}

function createMcpServer(serviceId) {
  const service = getServiceDefinition(serviceId);

  if (!service) {
    return null;
  }

  const server = new McpServer(
    {
      name: `${service.name}-mcp-server`,
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.registerTool(
    service.toolName,
    {
      title: service.title,
      description: service.description,
      inputSchema: service.inputSchema
    },
    async (args) => createToolResult(await service.handler(args))
  );

  return server;
}

function sendJsonRpcError(res, status, message, id = null, code = -32000) {
  return res.status(status).json({
    jsonrpc: '2.0',
    error: {
      code,
      message
    },
    id
  });
}

export function mcpRouter() {
  const router = Router();

  router.get('/:serviceId/demo', async (req, res) => {
    try {
      const { serviceId } = req.params;
      const query = req.query.q || req.query.location || 'Medellin';

      if (serviceId === 'weather') {
        return res.json({ service: 'weather', result: await runWeather(query) });
      }

      if (serviceId === 'wikipedia') {
        return res.json({ service: 'wikipedia', result: await runWikipedia(query) });
      }

      return res.status(404).json({ error: 'MCP service not found.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/:serviceId', async (req, res) => {
    const server = createMcpServer(req.params.serviceId);

    if (!server) {
      return sendJsonRpcError(res, 404, 'MCP service not found.', req.body?.id ?? null, -32601);
    }

    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return res;
    } catch (error) {
      console.error('Error handling MCP request:', error);

      if (!res.headersSent) {
        return sendJsonRpcError(
          res,
          500,
          error instanceof Error ? error.message : 'Internal server error',
          req.body?.id ?? null,
          -32603
        );
      }
    } finally {
      await server.close();
    }
  });

  router.get('/:serviceId', (req, res) =>
    sendJsonRpcError(res, 405, 'Method not allowed. Use POST.', req.body?.id ?? null)
  );

  router.delete('/:serviceId', (req, res) =>
    sendJsonRpcError(res, 405, 'Method not allowed. Use POST.', req.body?.id ?? null)
  );

  return router;
}
