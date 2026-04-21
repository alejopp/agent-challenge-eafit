import crypto from "node:crypto";
import { mapBotRecord, statements } from "../lib/db.js";
import { normalizeSlug } from "../lib/slug.js";

function now() {
  return new Date().toISOString();
}

function serializeBot(payload) {
  return {
    slug: normalizeSlug(payload.slug || payload.name),
    name: payload.name?.trim(),
    profession: payload.profession?.trim(),
    personaDescription: payload.personaDescription?.trim(),
    personaPhotoUrl: payload.personaPhotoUrl || "",
    serviceName: payload.serviceName?.trim(),
    serviceDescription: payload.serviceDescription?.trim(),
    serviceCategory: payload.serviceCategory?.trim(),
    prompt: payload.prompt?.trim(),
    mcpServersJson: JSON.stringify(payload.mcpServers || []),
    ragDocumentsJson: JSON.stringify(payload.ragDocuments || [])
  };
}

function validateBotInput(payload) {
  const requiredFields = [
    "name",
    "slug",
    "profession",
    "personaDescription",
    "serviceName",
    "serviceDescription",
    "serviceCategory",
    "prompt"
  ];

  for (const field of requiredFields) {
    if (!payload[field] || !String(payload[field]).trim()) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

export function listBotsForUser(userId) {
  return statements.listBotsByUser.all(userId).map(mapBotRecord);
}

export function getBotForUser(userId, botId) {
  return mapBotRecord(statements.findBotById.get(botId, userId));
}

export function createBot(userId, payload) {
  validateBotInput(payload);
  const serialized = serializeBot(payload);
  const timestamp = now();
  const record = {
    id: crypto.randomUUID(),
    userId,
    status: "draft",
    publicUrl: "",
    generatedBundlePath: "",
    publishedAt: "",
    createdAt: timestamp,
    updatedAt: timestamp,
    ...serialized
  };

  try {
    statements.createBot.run(record);
  } catch (reason) {
    if (String(reason.message).includes("idx_bots_slug_unique")) {
      throw new Error("This URL slug is already in use. Please choose a different slug.");
    }
    throw reason;
  }
  return getBotForUser(userId, record.id);
}

export function updateBot(userId, botId, payload) {
  validateBotInput(payload);
  const serialized = serializeBot(payload);
  try {
    statements.updateBot.run({
      id: botId,
      userId,
      updatedAt: now(),
      ...serialized
    });
  } catch (reason) {
    if (String(reason.message).includes("idx_bots_slug_unique")) {
      throw new Error("This URL slug is already in use. Please choose a different slug.");
    }
    throw reason;
  }
  return getBotForUser(userId, botId);
}

export function deleteBot(userId, botId) {
  statements.deleteBot.run(botId, userId);
}

export function updateBotPublishingState(userId, botId, patch) {
  statements.updateBotPublishing.run({
    id: botId,
    userId,
    status: patch.status,
    publicUrl: patch.publicUrl || "",
    generatedBundlePath: patch.generatedBundlePath || "",
    publishedAt: patch.publishedAt || "",
    updatedAt: now()
  });
  return getBotForUser(userId, botId);
}

export function getDashboard(userId) {
  const bots = listBotsForUser(userId);
  const summary = {
    totalBots: bots.length,
    publishedBots: bots.filter((bot) => bot.status === "published").length,
    draftBots: bots.filter((bot) => bot.status !== "published").length,
    totalSelectedMcp: bots.reduce((count, bot) => count + bot.mcpServers.length, 0)
  };
  return { summary, bots };
}
