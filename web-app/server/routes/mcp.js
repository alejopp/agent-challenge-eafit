import { Router } from 'express';

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
    try {
      const { serviceId } = req.params;
      const args = req.body?.arguments || {};

      if (serviceId === 'weather') {
        return res.json({
          tool: 'get_forecast',
          result: await runWeather(args.location || 'Medellin')
        });
      }

      if (serviceId === 'wikipedia') {
        return res.json({
          tool: 'search_article',
          result: await runWikipedia(args.query || 'Verana')
        });
      }

      return res.status(404).json({ error: 'MCP service not found.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}
