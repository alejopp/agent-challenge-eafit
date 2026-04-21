const API_BASE = "/api";

const headers = (token, extra = {}) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra
});

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  register(payload) {
    return fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload)
    }).then(parseResponse);
  },
  login(payload) {
    return fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload)
    }).then(parseResponse);
  },
  me(token) {
    return fetch(`${API_BASE}/auth/me`, {
      headers: headers(token)
    }).then(parseResponse);
  },
  getDashboard(token) {
    return fetch(`${API_BASE}/dashboard`, {
      headers: headers(token)
    }).then(parseResponse);
  },
  getBot(token, id) {
    return fetch(`${API_BASE}/bots/${id}`, {
      headers: headers(token)
    }).then(parseResponse);
  },
  createBot(token, payload) {
    return fetch(`${API_BASE}/bots`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(payload)
    }).then(parseResponse);
  },
  updateBot(token, id, payload) {
    return fetch(`${API_BASE}/bots/${id}`, {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify(payload)
    }).then(parseResponse);
  },
  deleteBot(token, id) {
    return fetch(`${API_BASE}/bots/${id}`, {
      method: "DELETE",
      headers: headers(token)
    }).then(parseResponse);
  },
  publishBot(token, id) {
    return fetch(`${API_BASE}/bots/${id}/publish`, {
      method: "POST",
      headers: headers(token)
    }).then(parseResponse);
  },
  unpublishBot(token, id) {
    return fetch(`${API_BASE}/bots/${id}/unpublish`, {
      method: "POST",
      headers: headers(token)
    }).then(parseResponse);
  },
  getPlatformConfig(token) {
    return fetch(`${API_BASE}/platform/config`, {
      headers: headers(token)
    }).then(parseResponse);
  },
  async uploadFiles(token, files) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch(`${API_BASE}/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData
    });

    return parseResponse(response);
  }
};
