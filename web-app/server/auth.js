import jwt from 'jsonwebtoken';
import { getUserById } from './db.js';

export function signAuthToken(user, secret) {
  return jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: '7d' });
}

export function authMiddleware(secret) {
  return (req, res, next) => {
    const token = req.cookies.persona_ai_session;

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const payload = jwt.verify(token, secret);
      req.user = getUserById(payload.sub) || null;
    } catch {
      req.user = null;
    }

    return next();
  };
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  return next();
}
