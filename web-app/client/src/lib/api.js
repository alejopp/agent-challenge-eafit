async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const raw = await response.text();
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? JSON.parse(raw || '{}') : null;

  if (!response.ok) {
    throw new Error(data?.error || raw || `Request failed with status ${response.status}.`);
  }

  if (!isJson) {
    throw new Error(raw || 'The server returned a non-JSON response.');
  }

  return data;
}

export const api = {
  getSession: () => request('/api/auth/me'),
  register: (payload) =>
    request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),
  logout: () =>
    request('/api/auth/logout', {
      method: 'POST'
    }),
  getMeta: () => request('/api/meta/config'),
  getMcpServices: () => request('/api/meta/mcp-services'),
  getBots: () => request('/api/bots'),
  getBot: (botId) => request(`/api/bots/${botId}`),
  createBot: (formData) =>
    request('/api/bots', {
      method: 'POST',
      body: formData
    }),
  updateBot: (botId, formData) =>
    request(`/api/bots/${botId}`, {
      method: 'PUT',
      body: formData
    }),
  publishBot: (botId) =>
    request(`/api/bots/${botId}/publish`, {
      method: 'POST'
    }),
  unpublishBot: (botId) =>
    request(`/api/bots/${botId}/unpublish`, {
      method: 'POST'
    }),
  deleteBot: (botId) =>
    request(`/api/bots/${botId}`, {
      method: 'DELETE'
    }),
  getInvitation: (botId) => request(`/api/bots/${botId}/invitation`)
};
