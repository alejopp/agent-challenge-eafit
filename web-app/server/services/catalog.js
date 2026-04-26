export const MCP_SERVICES = [
  {
    id: 'weather',
    name: 'Weather MCP',
    description: 'Checks forecast conditions for appointments and outdoor services.',
    category: 'Utilities',
    transport: 'streamable-http',
    authRequired: false,
    tools: ['get_forecast']
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia MCP',
    description: 'Searches encyclopedia articles to answer general knowledge questions.',
    category: 'Knowledge',
    transport: 'streamable-http',
    authRequired: false,
    tools: ['search_article']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Reserved slot for future OAuth-based appointment scheduling.',
    category: 'Productivity',
    transport: 'oauth-http',
    authRequired: true,
    tools: ['list_events', 'create_event'],
    comingSoon: true
  }
];
