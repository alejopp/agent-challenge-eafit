import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import fs from 'node:fs';
import path from 'node:path';

// Force load .env manually if Node.js --env-file didn't work
const envPath = path.join(process.cwd(), '.env');
console.log('[Server] Looking for .env at:', envPath);
console.log('[Server] File exists?:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !key.startsWith('#')) {
      const value = valueParts.join('=').trim();
      if (value && !process.env[key.trim()]) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
  console.log('[Server] Loaded .env manually, GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'set (length: ' + process.env.GOOGLE_CLIENT_ID.length + ')' : 'not set');
} else {
  // Try alternate path from __dirname
  const altPath = path.join(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)), '..', '.env');
  console.log('[Server] Trying alternate path:', altPath);
  if (fs.existsSync(altPath)) {
    const envContent = fs.readFileSync(altPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0 && !key.startsWith('#')) {
        const value = valueParts.join('=').trim();
        if (value && !process.env[key.trim()]) {
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
    console.log('[Server] Loaded .env from alternate path, GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'set' : 'not set');
  } else {
    console.log('[Server] .env file not found at either location!');
  }
}

import { config } from './config.js';
import { initDb } from './db.js';
import { authMiddleware, requireAuth } from './auth.js';
import { ensureAppDirectories } from './utils/files.js';
import { authRouter } from './routes/auth.js';
import { botsRouter } from './routes/bots.js';
import { metaRouter } from './routes/meta.js';
import { mcpRouter } from './routes/mcp.js';
import { calendarOAuthRouter } from './routes/calendarOAuth.js';
import { setupOAuth, getOAuthRouter } from './oauth.js';

const app = express();
const generatedDir = path.join(config.rootDir, 'generated');
ensureAppDirectories(config.storageDir, generatedDir);
initDb(config.databasePath);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(
  cors({
    origin: [config.clientDevUrl, config.appUrl],
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(authMiddleware(config.jwtSecret));
app.use('/uploads', express.static(path.join(config.storageDir, 'uploads')));

// Setup OAuth strategies
console.log('[Server] Setting up OAuth with config:', {
  googleClientId: config.googleClientId ? 'set' : 'not set',
  baseUrl: config.baseUrl
});
setupOAuth(config);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter(config));
const oauthRouter = getOAuthRouter(passport, config);
console.log('[Server] OAuth router routes:', oauthRouter.stack?.map(r => r.route?.path).filter(Boolean));
app.use('/api/auth/oauth', oauthRouter);

// Debug route
app.get('/api/auth/oauth/test', (_req, res) => {
  res.json({ status: 'OAuth router is working' });
});
app.use('/api/meta', metaRouter(config));
app.use('/api/mcp', mcpRouter(config));
app.use('/api/calendar', calendarOAuthRouter(config));
app.use('/api/bots', requireAuth, botsRouter(config));

const clientBuildDir = path.join(config.rootDir, 'dist/client');
if (fs.existsSync(clientBuildDir)) {
  app.use(express.static(clientBuildDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(path.join(clientBuildDir, 'index.html'));
  });
}

app.listen(config.port, config.host, () => {
  console.log(`Persona AI Agent Builder listening on http://${config.host}:${config.port}`);
});
