import { getGoogleCalendarToken, saveGoogleCalendarToken } from '../db.js';

export async function getFreshGoogleToken(userId, config) {
  const stored = getGoogleCalendarToken(userId);
  if (!stored) return null;

  const savedAt = new Date(stored.savedAt).getTime();
  const expiresIn = (stored.expires_in || 3600) * 1000;
  const isExpired = Date.now() > savedAt + expiresIn - 60_000;

  if (!isExpired) return stored.access_token;

  if (!stored.refresh_token) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      refresh_token: stored.refresh_token,
      grant_type: 'refresh_token'
    }).toString()
  });

  const data = await res.json();
  if (data.error) {
    console.error('[GoogleTokens] Refresh error:', data.error_description || data.error);
    return null;
  }

  saveGoogleCalendarToken(userId, {
    ...stored,
    access_token: data.access_token,
    expires_in: data.expires_in || 3600,
    savedAt: new Date().toISOString()
  });

  return data.access_token;
}
