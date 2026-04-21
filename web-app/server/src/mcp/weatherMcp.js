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

async function geocodeLocation(location) {
  const query = new URLSearchParams({ name: location, count: "1", language: "en", format: "json" });
  const response = await getJson(`https://geocoding-api.open-meteo.com/v1/search?${query.toString()}`);
  const result = response.results?.[0];

  if (!result) {
    throw new Error(`Could not find coordinates for "${location}"`);
  }

  return result;
}

async function currentWeather(location) {
  const point = await geocodeLocation(location);
  const query = new URLSearchParams({
    latitude: String(point.latitude),
    longitude: String(point.longitude),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    timezone: "auto"
  });
  const response = await getJson(`https://api.open-meteo.com/v1/forecast?${query.toString()}`);
  return {
    location: `${point.name}, ${point.country}`,
    ...response.current
  };
}

async function outdoorVisitPlan(location) {
  const weather = await currentWeather(location);
  const suitable = Number(weather.wind_speed_10m) < 25 && Number(weather.temperature_2m) >= 12;
  return {
    recommendation: suitable
      ? `Conditions look acceptable for an outdoor service visit in ${weather.location}.`
      : `Conditions may be difficult for an outdoor service visit in ${weather.location}.`,
    details: weather
  };
}

export async function handleWeatherMcp(message) {
  if (message.method === "initialize") {
    return {
      protocolVersion: "2024-11-05",
      serverInfo: {
        name: "weather-planner-mcp",
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
          name: "lookup_weather",
          description: "Get current weather conditions for a city or location.",
          inputSchema: {
            type: "object",
            properties: {
              location: {
                type: "string"
              }
            },
            required: ["location"]
          }
        },
        {
          name: "plan_outdoor_visit",
          description: "Recommend whether an outdoor service appointment should proceed.",
          inputSchema: {
            type: "object",
            properties: {
              location: {
                type: "string"
              }
            },
            required: ["location"]
          }
        }
      ]
    };
  }

  if (message.method === "tools/call") {
    const tool = message.params?.name;
    const location = message.params?.arguments?.location;

    if (!location) {
      throw new Error("location is required");
    }

    const result = tool === "lookup_weather" ? await currentWeather(location) : await outdoorVisitPlan(location);

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
