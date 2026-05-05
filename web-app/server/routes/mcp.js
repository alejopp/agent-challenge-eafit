import { Router } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as z from 'zod/v4';
import { getFreshGoogleToken } from '../utils/googleTokens.js';

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

let _mcpConfig = null;
export function initMcpConfig(config) { _mcpConfig = config; }

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

async function runGoogleCalendarListEvents(userId, { maxResults = 10, timeMin }) {
  const accessToken = await getFreshGoogleToken(userId, _mcpConfig);
  if (!accessToken) throw new Error('Google Calendar not connected. Please connect your account first.');

  const params = new URLSearchParams({
    maxResults: String(maxResults),
    singleEvents: 'true',
    orderBy: 'startTime',
    timeMin: timeMin || new Date().toISOString()
  });

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) throw new Error(`Google Calendar API error: ${res.status}`);
  const data = await res.json();

  return (data.items || []).map((e) => ({
    id: e.id,
    title: e.summary,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    location: e.location || null,
    description: e.description || null
  }));
}

async function runGoogleCalendarCreateEvent(userId, { title, startDateTime, endDateTime, description, location }) {
  const accessToken = await getFreshGoogleToken(userId, _mcpConfig);
  if (!accessToken) throw new Error('Google Calendar not connected. Please connect your account first.');

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: title,
      description,
      location,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime }
    })
  });

  if (!res.ok) throw new Error(`Google Calendar API error: ${res.status}`);
  const event = await res.json();
  return { id: event.id, title: event.summary, link: event.htmlLink };
}

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

export function mcpRouter(config) {
  if (config) initMcpConfig(config);
  const router = Router();

  router.post('/google-calendar/:userId', async (req, res) => {
    const { userId } = req.params;
    const body = req.body || {};
    const toolName = body.params?.name;

    try {
      let result;
      if (toolName === 'list_events') {
        result = await runGoogleCalendarListEvents(userId, body.params?.arguments || {});
      } else if (toolName === 'create_event') {
        result = await runGoogleCalendarCreateEvent(userId, body.params?.arguments || {});
      } else {
        return sendJsonRpcError(res, 400, `Unknown tool: ${toolName}`, body.id ?? null);
      }

      const server = new McpServer({ name: 'google-calendar-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });
      server.registerTool('list_events', { title: 'List Calendar Events', description: 'Lists upcoming events from Google Calendar.', inputSchema: { maxResults: z.number().optional(), timeMin: z.string().optional() } }, async (args) => createToolResult(await runGoogleCalendarListEvents(userId, args)));
      server.registerTool('create_event', { title: 'Create Calendar Event', description: 'Creates a new event in Google Calendar.', inputSchema: { title: z.string(), startDateTime: z.string(), endDateTime: z.string(), description: z.string().optional(), location: z.string().optional() } }, async (args) => createToolResult(await runGoogleCalendarCreateEvent(userId, args)));

      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return res;
    } catch (error) {
      console.error('[MCP Google Calendar] Error:', error.message);
      if (!res.headersSent) return sendJsonRpcError(res, 500, error.message, body.id ?? null);
    }
  });

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
