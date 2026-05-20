export const MCP_SERVICES = [
  {
    id: 'weather',
    name: 'Weather',
    description: 'Consulta el pronóstico del tiempo y condiciones climáticas para gestionar citas y actividades al aire libre.',
    category: 'Utilities',
    transport: 'streamable-http',
    authRequired: false,
    tools: ['get_forecast']
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    description: 'Busca artículos en Wikipedia para responder preguntas de conocimiento general.',
    category: 'Conocimiento',
    transport: 'streamable-http',
    authRequired: false,
    tools: ['search_article']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Consulta, crea, modifica y elimina eventos en el Google Calendar del dueño del bot. Requiere conectar tu cuenta Google desde la configuración del bot.',
    category: 'Productivity',
    transport: 'streamable-http',
    authRequired: true,
    tools: ['list_events', 'create_event', 'update_event', 'delete_event']
  },
  {
    id: 'google-gmail',
    name: 'Gmail',
    description: 'Lee, busca y envía correos desde el Gmail del dueño del bot. Requiere conectar tu cuenta Google desde la configuración del bot.',
    category: 'Productivity',
    transport: 'streamable-http',
    authRequired: true,
    tools: ['list_emails', 'read_email', 'search_emails', 'send_email']
  }
];
