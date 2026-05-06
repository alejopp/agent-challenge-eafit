import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import {
  createBot,
  deleteBot,
  getBotByIdForUser,
  listBotsByUser,
  updateBot
} from '../db.js';
import { MCP_SERVICES } from '../services/catalog.js';
import {
  prepareBotForPersistence,
  publishBot,
  unpublishBot,
  issueServiceCredential
} from '../services/deployment.js';

function createUploader(config) {
  const uploadsDir = path.join(config.storageDir, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname);
      callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    }
  });

  return multer({ storage });
}

function parseBotPayload(body, files, existingBot) {
  const mcpServices = JSON.parse(body.mcpServices || '[]');
  const ragFiles = [
    ...(existingBot?.ragFiles || []),
    ...((files?.ragFiles || []).map((file) => ({
      originalName: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size
    })))
  ];

  return {
    status: body.status || existingBot?.status || 'draft',
    personaName: body.personaName,
    profession: body.profession,
    personaDescription: body.personaDescription,
    personaPhotoPath: files?.personaPhoto?.[0]
      ? `/uploads/${files.personaPhoto[0].filename}`
      : existingBot?.personaPhotoPath || null,
    serviceName: body.serviceName,
    serviceDescription: body.serviceDescription,
    serviceCategory: body.serviceCategory,
    prompt: body.prompt,
    mcpServices,
    ragFiles
  };
}

export function botsRouter(config) {
  const router = Router();
  const upload = createUploader(config);

  router.get('/', (req, res) => {
    const bots = listBotsByUser(req.user.id);
    return res.json({
      bots,
      stats: {
        totalBots: bots.length,
        publishedBots: bots.filter((bot) => bot.status === 'published').length,
        draftBots: bots.filter((bot) => bot.status !== 'published').length,
        mcpServices: MCP_SERVICES.filter((service) => !service.comingSoon).length
      }
    });
  });

  router.get('/:botId', (req, res) => {
    const bot = getBotByIdForUser(req.params.botId, req.user.id);
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found.' });
    }
    return res.json({ bot });
  });

  router.post(
    '/',
    upload.fields([
      { name: 'personaPhoto', maxCount: 1 },
      { name: 'ragFiles', maxCount: 10 }
    ]),
    (req, res) => {
      const payload = parseBotPayload(req.body, req.files);
      const prepared = prepareBotForPersistence(payload, config);
      const now = new Date().toISOString();

      const bot = createBot({
        id: crypto.randomUUID(),
        user_id: req.user.id,
        ...prepared,
        deployment_status: 'draft',
        deployment_notes: 'Bot created successfully.',
        last_published_at: null,
        created_at: now,
        updated_at: now
      });

      return res.status(201).json({ bot });
    }
  );

  router.put(
    '/:botId',
    upload.fields([
      { name: 'personaPhoto', maxCount: 1 },
      { name: 'ragFiles', maxCount: 10 }
    ]),
    (req, res) => {
      const existingBot = getBotByIdForUser(req.params.botId, req.user.id);
      if (!existingBot) {
        return res.status(404).json({ error: 'Bot not found.' });
      }

      const payload = parseBotPayload(req.body, req.files, existingBot);
      const prepared = prepareBotForPersistence(payload, config, existingBot);
      const bot = updateBot(req.params.botId, req.user.id, {
        ...prepared,
        deploymentStatus: existingBot.deploymentStatus,
        deploymentNotes: 'Bot updated successfully.'
      });

      return res.json({ bot });
    }
  );

  router.post('/:botId/publish', async (req, res) => {
    const existingBot = getBotByIdForUser(req.params.botId, req.user.id);
    if (!existingBot) {
      return res.status(404).json({ error: 'Bot not found.' });
    }

    let result;
    try {
      result = await publishBot(existingBot, config);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }

    const bot = updateBot(req.params.botId, req.user.id, {
      status: result.success ? 'published' : existingBot.status,
      deploymentStatus: result.success ? 'published' : 'error',
      deploymentNotes: result.notes,
      lastPublishedAt: result.success ? new Date().toISOString() : existingBot.lastPublishedAt
    });

    return res.json({ bot, deployment: result });
  });

  router.post('/:botId/issue-credential', async (req, res) => {
    const existingBot = getBotByIdForUser(req.params.botId, req.user.id);
    if (!existingBot) {
      return res.status(404).json({ error: 'Bot not found.' });
    }
    if (existingBot.status !== 'published') {
      return res.status(400).json({ error: 'Bot must be published before issuing credentials.' });
    }
    try {
      const result = await issueServiceCredential(existingBot, config);
      return res.json({ result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.get('/:botId/invitation', async (req, res) => {
    const bot = getBotByIdForUser(req.params.botId, req.user.id);
    if (!bot || bot.status !== 'published' || !bot.publicUrl) {
      return res.status(404).json({ error: 'Bot not published.' });
    }

    // Strategy 1: fetch VS Agent public page and extract OOB parameter from HTML
    try {
      const pageResp = await fetch(bot.publicUrl, { headers: { 'Accept': 'text/html,application/json' } });
      if (pageResp.ok) {
        const text = await pageResp.text();
        try {
          const data = JSON.parse(text);
          const invUrl = data.invitationUrl || data.invitation_url || data.oob;
          if (invUrl) {
            console.log('[invitation] Got URL from VS Agent JSON');
            return res.json({ invitationUrl: invUrl });
          }
        } catch { /* not JSON, parse HTML */ }
        const oobMatch = text.match(/[?&]oob=([A-Za-z0-9+/=_\-]+)/);
        if (oobMatch) {
          const invUrl = `${bot.publicUrl}?oob=${oobMatch[1]}`;
          console.log('[invitation] Extracted OOB from VS Agent HTML');
          return res.json({ invitationUrl: invUrl });
        }
      }
    } catch (e) {
      console.warn('[invitation] VS Agent page fetch failed:', e.message);
    }

    // Strategy 2: try multiple admin API endpoints
    if (bot.releaseName) {
      const adminApi = `http://${bot.releaseName}.${config.k8sNamespace}:3000`;
      const endpoints = [
        { method: 'POST', path: '/v1/oob/create-invitation', body: { handshake: true } },
        { method: 'POST', path: '/oob/create-invitation', body: {} },
        { method: 'POST', path: '/v1/connections/create-invitation', body: {} },
        { method: 'GET',  path: '/v1/oob/invitation', body: null },
      ];
      for (const ep of endpoints) {
        try {
          const resp = await fetch(`${adminApi}${ep.path}`, {
            method: ep.method,
            headers: { 'Content-Type': 'application/json' },
            ...(ep.body ? { body: JSON.stringify(ep.body) } : {})
          });
          console.log(`[invitation] ${ep.method} ${ep.path} → ${resp.status}`);
          if (resp.ok) {
            const data = await resp.json();
            console.log('[invitation] Response keys:', Object.keys(data).join(', '));
            const invUrl = data.invitationUrl || data.invitation_url || data.url || data.oob_url;
            if (invUrl) return res.json({ invitationUrl: invUrl });
          }
        } catch (e) {
          console.warn(`[invitation] ${ep.path} failed:`, e.message);
        }
      }
    }

    console.log('[invitation] All strategies failed, returning publicUrl');
    return res.json({ invitationUrl: bot.publicUrl });
  });

  router.post('/:botId/unpublish', (req, res) => {
    const existingBot = getBotByIdForUser(req.params.botId, req.user.id);
    if (!existingBot) {
      return res.status(404).json({ error: 'Bot not found.' });
    }

    const result = unpublishBot(existingBot, config);
    const bot = updateBot(req.params.botId, req.user.id, {
      status: result.success ? 'draft' : existingBot.status,
      deploymentStatus: result.success ? 'unpublished' : 'error',
      deploymentNotes: result.notes
    });

    return res.json({ bot, deployment: result });
  });

  router.delete('/:botId', (req, res) => {
    const existingBot = getBotByIdForUser(req.params.botId, req.user.id);
    if (!existingBot) {
      return res.status(404).json({ error: 'Bot not found.' });
    }
    const deleted = deleteBot(req.params.botId, req.user.id);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete bot.' });
    }
    return res.status(204).send();
  });

  return router;
}
