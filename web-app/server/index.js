import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { initDb } from './db.js';
import { authMiddleware, requireAuth } from './auth.js';
import { ensureAppDirectories } from './utils/files.js';
import { authRouter } from './routes/auth.js';
import { botsRouter } from './routes/bots.js';
import { metaRouter } from './routes/meta.js';
import { mcpRouter } from './routes/mcp.js';

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
app.use(authMiddleware(config.jwtSecret));
app.use('/uploads', express.static(path.join(config.storageDir, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter(config));
app.use('/api/meta', metaRouter(config));
app.use('/api/mcp', mcpRouter());
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
