import { Router } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as z from 'zod/v4';
import { getUserCalendarToken, saveUserCalendarToken, getUserGmailToken, saveUserGmailToken } from '../db.js';

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

// ─── Google Calendar helpers ──────────────────────────────────────────────────

async function calendarFetch(url, accessToken, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error?.message || `Calendar API error: ${res.status}`);
  return body;
}

async function runListEvents(accessToken, { maxResults = 10, timeMin, query } = {}) {
  const params = new URLSearchParams({
    maxResults: String(Math.min(Number(maxResults) || 10, 50)),
    orderBy: 'startTime',
    singleEvents: 'true',
    timeMin: timeMin || new Date().toISOString()
  });
  if (query) params.set('q', query);
  const data = await calendarFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    accessToken
  );
  return (data.items || []).map((e) => ({
    id: e.id,
    summary: e.summary || '(sin título)',
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    location: e.location || null,
    description: e.description || null,
    status: e.status
  }));
}

async function runCreateEvent(accessToken, { summary, startDateTime, endDateTime, description, location, attendees, timeZone } = {}) {
  const tz = timeZone || 'America/Bogota';
  const event = {
    summary,
    description: description || '',
    location: location || '',
    start: { dateTime: startDateTime, timeZone: tz },
    end: { dateTime: endDateTime, timeZone: tz },
    ...(attendees?.length ? { attendees: attendees.map((email) => ({ email })) } : {})
  };
  const data = await calendarFetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    accessToken,
    { method: 'POST', body: JSON.stringify(event) }
  );
  return { id: data.id, summary: data.summary, htmlLink: data.htmlLink, start: data.start, end: data.end };
}

async function runUpdateEvent(accessToken, { eventId, summary, startDateTime, endDateTime, description, location, timeZone } = {}) {
  const tz = timeZone || 'America/Bogota';
  const patch = {};
  if (summary !== undefined) patch.summary = summary;
  if (description !== undefined) patch.description = description;
  if (location !== undefined) patch.location = location;
  if (startDateTime) patch.start = { dateTime: startDateTime, timeZone: tz };
  if (endDateTime) patch.end = { dateTime: endDateTime, timeZone: tz };
  const data = await calendarFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    accessToken,
    { method: 'PATCH', body: JSON.stringify(patch) }
  );
  return { id: data.id, summary: data.summary, updated: data.updated };
}

async function runDeleteEvent(accessToken, { eventId } = {}) {
  await calendarFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    accessToken,
    { method: 'DELETE' }
  );
  return { success: true, eventId };
}

async function getValidAccessToken(tokenData, userId, config) {
  if (!tokenData) return null;
  const expiresAt = tokenData.expiresAt ? new Date(tokenData.expiresAt).getTime() : Infinity;
  if (Date.now() < expiresAt - 60_000) return tokenData.accessToken;
  if (!tokenData.refreshToken || !config?.googleClientId) return tokenData.accessToken;
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        refresh_token: tokenData.refreshToken,
        grant_type: 'refresh_token'
      }).toString()
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error_description || data.error);
    const newExpiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null;
    saveUserCalendarToken(userId, data.access_token, tokenData.refreshToken, newExpiresAt);
    return data.access_token;
  } catch (err) {
    console.warn('[MCP] Token refresh failed:', err.message);
    return tokenData.accessToken;
  }
}

function createGoogleCalendarMcpServer(accessToken) {
  const server = new McpServer(
    { name: 'google-calendar-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    'list_events',
    {
      title: 'Google Calendar – Listar eventos',
      description: 'Lista próximos eventos del Google Calendar del usuario.',
      inputSchema: {
        maxResults: z.number().int().min(1).max(50).optional().describe('Número máximo de eventos (por defecto 10)'),
        timeMin: z.string().optional().describe('Fecha/hora mínima en ISO 8601 (por defecto ahora)'),
        query: z.string().optional().describe('Texto de búsqueda libre')
      }
    },
    async (args) => createToolResult(await runListEvents(accessToken, args))
  );

  server.registerTool(
    'create_event',
    {
      title: 'Google Calendar – Crear evento',
      description: 'Crea un nuevo evento en el Google Calendar del usuario.',
      inputSchema: {
        summary: z.string().min(1).describe('Título del evento'),
        startDateTime: z.string().describe('Fecha y hora de inicio en ISO 8601, ej: 2025-06-01T10:00:00'),
        endDateTime: z.string().describe('Fecha y hora de fin en ISO 8601'),
        description: z.string().optional().describe('Descripción del evento'),
        location: z.string().optional().describe('Ubicación del evento'),
        attendees: z.array(z.string().email()).optional().describe('Lista de emails de asistentes'),
        timeZone: z.string().optional().describe('Zona horaria, ej: America/Bogota')
      }
    },
    async (args) => createToolResult(await runCreateEvent(accessToken, args))
  );

  server.registerTool(
    'update_event',
    {
      title: 'Google Calendar – Actualizar evento',
      description: 'Modifica un evento existente en el Google Calendar del usuario.',
      inputSchema: {
        eventId: z.string().min(1).describe('ID del evento a modificar'),
        summary: z.string().optional().describe('Nuevo título del evento'),
        startDateTime: z.string().optional().describe('Nueva fecha/hora de inicio en ISO 8601'),
        endDateTime: z.string().optional().describe('Nueva fecha/hora de fin en ISO 8601'),
        description: z.string().optional().describe('Nueva descripción'),
        location: z.string().optional().describe('Nueva ubicación'),
        timeZone: z.string().optional().describe('Zona horaria, ej: America/Bogota')
      }
    },
    async (args) => createToolResult(await runUpdateEvent(accessToken, args))
  );

  server.registerTool(
    'delete_event',
    {
      title: 'Google Calendar – Eliminar evento',
      description: 'Elimina un evento del Google Calendar del usuario.',
      inputSchema: {
        eventId: z.string().min(1).describe('ID del evento a eliminar')
      }
    },
    async (args) => createToolResult(await runDeleteEvent(accessToken, args))
  );

  return server;
}

// ─── Gmail helpers ────────────────────────────────────────────────────────────

async function gmailFetch(url, accessToken, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error?.message || `Gmail API error: ${res.status}`);
  return body;
}

function decodeBase64Url(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function extractHeader(headers, name) {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

function extractEmailBody(payload) {
  if (!payload) return '';
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  if (payload.parts) {
    const text = payload.parts.find((p) => p.mimeType === 'text/plain');
    if (text?.body?.data) return decodeBase64Url(text.body.data);
    const html = payload.parts.find((p) => p.mimeType === 'text/html');
    if (html?.body?.data) return decodeBase64Url(html.body.data).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    for (const part of payload.parts) {
      const nested = extractEmailBody(part);
      if (nested) return nested;
    }
  }
  return '';
}

async function runListEmails(accessToken, { maxResults = 10, labelIds, q } = {}) {
  const params = new URLSearchParams({ maxResults: String(Math.min(Number(maxResults) || 10, 50)) });
  if (q) params.set('q', q);
  if (labelIds?.length) labelIds.forEach((l) => params.append('labelIds', l));
  const data = await gmailFetch(`https://www.googleapis.com/gmail/v1/users/me/messages?${params}`, accessToken);
  if (!data.messages?.length) return [];
  return Promise.all(
    data.messages.slice(0, 10).map(async ({ id }) => {
      const msg = await gmailFetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=To`,
        accessToken
      );
      const h = msg.payload?.headers || [];
      return {
        id: msg.id,
        from: extractHeader(h, 'From'),
        to: extractHeader(h, 'To'),
        subject: extractHeader(h, 'Subject'),
        date: extractHeader(h, 'Date'),
        snippet: msg.snippet || '',
        unread: msg.labelIds?.includes('UNREAD') || false
      };
    })
  );
}

async function runReadEmail(accessToken, { emailId } = {}) {
  const msg = await gmailFetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(emailId)}?format=full`,
    accessToken
  );
  const h = msg.payload?.headers || [];
  return {
    id: msg.id,
    from: extractHeader(h, 'From'),
    to: extractHeader(h, 'To'),
    cc: extractHeader(h, 'Cc'),
    subject: extractHeader(h, 'Subject'),
    date: extractHeader(h, 'Date'),
    body: extractEmailBody(msg.payload),
    snippet: msg.snippet || '',
    unread: msg.labelIds?.includes('UNREAD') || false
  };
}

async function runSearchEmails(accessToken, { query, maxResults = 10 } = {}) {
  return runListEmails(accessToken, { q: query, maxResults });
}

async function runSendEmail(accessToken, { to, subject, body, cc, bcc } = {}) {
  const subjectEncoded = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const lines = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    bcc ? `Bcc: ${bcc}` : null,
    `Subject: ${subjectEncoded}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body
  ].filter(Boolean);
  const raw = Buffer.from(lines.join('\r\n')).toString('base64url');
  const data = await gmailFetch(
    'https://www.googleapis.com/gmail/v1/users/me/messages/send',
    accessToken,
    { method: 'POST', body: JSON.stringify({ raw }) }
  );
  return { id: data.id, threadId: data.threadId, sent: true };
}

async function getValidGmailToken(tokenData, userId, config) {
  if (!tokenData) return null;
  const expiresAt = tokenData.expiresAt ? new Date(tokenData.expiresAt).getTime() : Infinity;
  if (Date.now() < expiresAt - 60_000) return tokenData.accessToken;
  if (!tokenData.refreshToken || !config?.googleClientId) return tokenData.accessToken;
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        refresh_token: tokenData.refreshToken,
        grant_type: 'refresh_token'
      }).toString()
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error_description || data.error);
    const newExpiresAt = data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null;
    saveUserGmailToken(userId, data.access_token, tokenData.refreshToken, newExpiresAt);
    return data.access_token;
  } catch (err) {
    console.warn('[MCP] Gmail token refresh failed:', err.message);
    return tokenData.accessToken;
  }
}

function createGmailMcpServer(accessToken) {
  const server = new McpServer(
    { name: 'gmail-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    'list_emails',
    {
      title: 'Gmail – Listar correos',
      description: 'Lista los correos más recientes del buzón.',
      inputSchema: {
        maxResults: z.number().int().min(1).max(50).optional().describe('Número máximo de correos (por defecto 10)'),
        labelIds: z.array(z.string()).optional().describe('Filtrar por etiquetas, ej: ["INBOX","UNREAD"]'),
        q: z.string().optional().describe('Búsqueda libre con sintaxis de Gmail, ej: "from:ejemplo@gmail.com"')
      }
    },
    async (args) => createToolResult(await runListEmails(accessToken, args))
  );

  server.registerTool(
    'read_email',
    {
      title: 'Gmail – Leer correo',
      description: 'Lee el contenido completo de un correo por su ID.',
      inputSchema: {
        emailId: z.string().min(1).describe('ID del correo a leer (obtenido de list_emails o search_emails)')
      }
    },
    async (args) => createToolResult(await runReadEmail(accessToken, args))
  );

  server.registerTool(
    'search_emails',
    {
      title: 'Gmail – Buscar correos',
      description: 'Busca correos usando la sintaxis de búsqueda de Gmail.',
      inputSchema: {
        query: z.string().min(1).describe('Consulta de búsqueda, ej: "from:jefe@empresa.com subject:reunión"'),
        maxResults: z.number().int().min(1).max(50).optional().describe('Número máximo de resultados (por defecto 10)')
      }
    },
    async (args) => createToolResult(await runSearchEmails(accessToken, args))
  );

  server.registerTool(
    'send_email',
    {
      title: 'Gmail – Enviar correo',
      description: 'Envía un correo electrónico desde la cuenta del usuario.',
      inputSchema: {
        to: z.string().min(1).describe('Destinatario, ej: "nombre@ejemplo.com"'),
        subject: z.string().min(1).describe('Asunto del correo'),
        body: z.string().min(1).describe('Cuerpo del correo en texto plano'),
        cc: z.string().optional().describe('Copia a (email o lista separada por comas)'),
        bcc: z.string().optional().describe('Copia oculta (email o lista separada por comas)')
      }
    },
    async (args) => createToolResult(await runSendEmail(accessToken, args))
  );

  return server;
}

export function mcpRouter(config = {}) {
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
    if (req.params.serviceId === 'google-calendar') {
      const { userId } = req.query;
      if (!userId) {
        return sendJsonRpcError(res, 400, 'Missing userId parameter for Google Calendar MCP.', req.body?.id ?? null);
      }
      const tokenData = getUserCalendarToken(userId);
      if (!tokenData) {
        return sendJsonRpcError(res, 401, 'Google Calendar no está conectado para este usuario. Conecta tu cuenta desde la configuración del bot.', req.body?.id ?? null);
      }
      const accessToken = await getValidAccessToken(tokenData, userId, config);
      const server = createGoogleCalendarMcpServer(accessToken);
      try {
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return res;
      } catch (error) {
        console.error('Error handling Google Calendar MCP request:', error);
        if (!res.headersSent) {
          return sendJsonRpcError(res, 500, error instanceof Error ? error.message : 'Internal server error', req.body?.id ?? null, -32603);
        }
      } finally {
        await server.close();
      }
      return;
    }

    if (req.params.serviceId === 'google-gmail') {
      const { userId } = req.query;
      if (!userId) {
        return sendJsonRpcError(res, 400, 'Missing userId parameter for Gmail MCP.', req.body?.id ?? null);
      }
      const tokenData = getUserGmailToken(userId);
      if (!tokenData) {
        return sendJsonRpcError(res, 401, 'Gmail no está conectado para este usuario. Conecta tu cuenta desde la configuración del bot.', req.body?.id ?? null);
      }
      const accessToken = await getValidGmailToken(tokenData, userId, config);
      const server = createGmailMcpServer(accessToken);
      try {
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return res;
      } catch (error) {
        console.error('Error handling Gmail MCP request:', error);
        if (!res.headersSent) {
          return sendJsonRpcError(res, 500, error instanceof Error ? error.message : 'Internal server error', req.body?.id ?? null, -32603);
        }
      } finally {
        await server.close();
      }
      return;
    }

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
