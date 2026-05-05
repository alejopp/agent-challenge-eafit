import { Router } from 'express';
import crypto from 'node:crypto';
import { requireAuth } from '../auth.js';
import {
  saveGoogleCalendarToken,
  getGoogleCalendarToken,
  deleteGoogleCalendarToken
} from '../db.js';

const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

export function calendarOAuthRouter(config) {
  const router = Router();

  router.get('/connect', requireAuth, (req, res) => {
    const state = crypto.randomUUID();
    res.cookie('gcal_oauth_state', `${state}|${req.user.id}`, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000
    });

    const params = new URLSearchParams({
      client_id: config.googleClientId,
      redirect_uri: `${config.baseUrl}/api/calendar/callback`,
      response_type: 'code',
      scope: CALENDAR_SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      state
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });

  router.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    const cookieValue = req.cookies?.gcal_oauth_state;

    if (!cookieValue || !code || !state) {
      return res.redirect(`${config.clientDevUrl}?error=calendar_oauth_failed`);
    }

    const pipeIdx = cookieValue.indexOf('|');
    const savedState = cookieValue.slice(0, pipeIdx);
    const userId = cookieValue.slice(pipeIdx + 1);

    if (state !== savedState || !userId) {
      return res.redirect(`${config.clientDevUrl}?error=calendar_oauth_failed`);
    }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.googleClientId,
          client_secret: config.googleClientSecret,
          redirect_uri: `${config.baseUrl}/api/calendar/callback`,
          grant_type: 'authorization_code'
        }).toString()
      });

      const tokens = await tokenRes.json();
      if (tokens.error) throw new Error(tokens.error_description || tokens.error);

      saveGoogleCalendarToken(userId, tokens);
      res.clearCookie('gcal_oauth_state');
      console.log('[Calendar OAuth] Tokens saved for user:', userId);
      res.redirect(`${config.clientDevUrl}?calendar=connected`);
    } catch (err) {
      console.error('[Calendar OAuth] Callback error:', err.message);
      res.redirect(`${config.clientDevUrl}?error=calendar_oauth_failed`);
    }
  });

  router.get('/status', requireAuth, (req, res) => {
    const tokens = getGoogleCalendarToken(req.user.id);
    res.json({ connected: !!tokens });
  });

  router.delete('/disconnect', requireAuth, (req, res) => {
    deleteGoogleCalendarToken(req.user.id);
    res.status(204).end();
  });

  return router;
}
