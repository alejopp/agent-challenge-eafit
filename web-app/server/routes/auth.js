import { Router } from 'express';
import crypto from 'node:crypto';
import { createUser, verifyUserCredentials } from '../db.js';
import { signAuthToken } from '../auth.js';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

export function authRouter(config) {
  const router = Router();

  router.post('/register', (req, res) => {
    const { displayName, name, email, password } = req.body;
    const resolvedDisplayName = displayName || name;

    if (!resolvedDisplayName || !email || !password) {
      return res
        .status(400)
        .json({ error: 'name/displayName, email and password are required.' });
    }

    try {
      const user = createUser({
        id: crypto.randomUUID(),
        displayName: resolvedDisplayName,
        email,
        password
      });
      const token = signAuthToken(user, config.jwtSecret);
      res.cookie('persona_ai_session', token, cookieOptions());
      return res.status(201).json({ user });
    } catch (error) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }
  });

  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = verifyUserCredentials(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signAuthToken(user, config.jwtSecret);
    res.cookie('persona_ai_session', token, cookieOptions());
    return res.json({ user });
  });

  router.post('/logout', (_req, res) => {
    res.clearCookie('persona_ai_session');
    return res.status(204).end();
  });

  router.get('/me', (req, res) => {
    return res.json({ user: req.user || null });
  });

  return router;
}
