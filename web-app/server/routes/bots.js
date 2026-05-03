import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import {
  createBot,
  getBotByIdForUser,
  listBotsByUser,
  updateBot
} from '../db.js';
import { MCP_SERVICES } from '../services/catalog.js';
import {
  prepareBotForPersistence,
  publishBot,
  unpublishBot
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

  router.post('/:botId/publish', (req, res) => {
    const existingBot = getBotByIdForUser(req.params.botId, req.user.id);
    if (!existingBot) {
      return res.status(404).json({ error: 'Bot not found.' });
    }

    let result;
    try {
      result = publishBot(existingBot, config);
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

  return router;
}
