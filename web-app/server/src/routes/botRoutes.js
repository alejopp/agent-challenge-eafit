import { Router } from "express";
import { authenticateRequest } from "../lib/auth.js";
import {
  createBot,
  deleteBot,
  getBotForUser,
  getDashboard,
  updateBot,
  updateBotPublishingState
} from "../services/botService.js";
import { publishBot, unpublishBot } from "../services/deploymentService.js";

export const botRouter = Router();

botRouter.use(authenticateRequest);

botRouter.get("/dashboard", (request, response) => {
  response.json(getDashboard(request.auth.sub));
});

botRouter.get("/bots/:botId", (request, response) => {
  const bot = getBotForUser(request.auth.sub, request.params.botId);
  if (!bot) {
    return response.status(404).json({ error: "Bot not found" });
  }
  response.json({ bot });
});

botRouter.post("/bots", (request, response) => {
  try {
    const bot = createBot(request.auth.sub, request.body);
    response.status(201).json({ bot });
  } catch (reason) {
    response.status(400).json({ error: reason.message });
  }
});

botRouter.put("/bots/:botId", (request, response) => {
  try {
    const bot = updateBot(request.auth.sub, request.params.botId, request.body);
    response.json({ bot });
  } catch (reason) {
    response.status(400).json({ error: reason.message });
  }
});

botRouter.delete("/bots/:botId", (request, response) => {
  deleteBot(request.auth.sub, request.params.botId);
  response.json({ success: true });
});

botRouter.post("/bots/:botId/publish", (request, response) => {
  const bot = getBotForUser(request.auth.sub, request.params.botId);
  if (!bot) {
    return response.status(404).json({ error: "Bot not found" });
  }

  try {
    const deployment = publishBot(bot);
    const updated = updateBotPublishingState(request.auth.sub, request.params.botId, {
      status: "published",
      publicUrl: deployment.publicUrl,
      generatedBundlePath: deployment.bundlePath,
      publishedAt: new Date().toISOString()
    });
    response.json({ bot: updated, deployment });
  } catch (reason) {
    response.status(500).json({ error: reason.message });
  }
});

botRouter.post("/bots/:botId/unpublish", (request, response) => {
  const bot = getBotForUser(request.auth.sub, request.params.botId);
  if (!bot) {
    return response.status(404).json({ error: "Bot not found" });
  }

  try {
    const deployment = unpublishBot(bot);
    const updated = updateBotPublishingState(request.auth.sub, request.params.botId, {
      status: "unpublished",
      publicUrl: deployment.publicUrl,
      generatedBundlePath: deployment.bundlePath,
      publishedAt: ""
    });
    response.json({ bot: updated, deployment });
  } catch (reason) {
    response.status(500).json({ error: reason.message });
  }
});
