import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

let databasePath;

function readStore() {
  return JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
}

function writeStore(data) {
  fs.writeFileSync(databasePath, JSON.stringify(data, null, 2));
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    createdAt: user.createdAt
  };
}

export function initDb(filePath) {
  databasePath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  if (!fs.existsSync(databasePath)) {
    writeStore({
      users: [],
      bots: []
    });
  }
}

export function createUser({ id, displayName, email, password }) {
  const store = readStore();
  const lowerEmail = email.toLowerCase();

  if (store.users.some((user) => user.email === lowerEmail)) {
    throw new Error('User already exists.');
  }

  const user = {
    id,
    displayName,
    email: lowerEmail,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString()
  };

  store.users.push(user);
  writeStore(store);
  return normalizeUser(user);
}

export function getUserByEmail(email) {
  const store = readStore();
  return store.users.find((user) => user.email === email.toLowerCase()) || null;
}

export function getUserById(id) {
  const store = readStore();
  return normalizeUser(store.users.find((user) => user.id === id));
}

export function verifyUserCredentials(email, password) {
  const user = getUserByEmail(email);
  if (!user) {
    return null;
  }

  return bcrypt.compareSync(password, user.passwordHash) ? normalizeUser(user) : null;
}

export function listBotsByUser(userId) {
  const store = readStore();
  return store.bots
    .filter((bot) => bot.userId === userId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function getBotByIdForUser(botId, userId) {
  const store = readStore();
  return store.bots.find((bot) => bot.id === botId && bot.userId === userId) || null;
}

export function createBot(bot) {
  const store = readStore();
  const nextBot = {
    id: bot.id,
    userId: bot.user_id,
    slug: bot.slug,
    status: bot.status,
    personaName: bot.persona_name || bot.personaName,
    profession: bot.profession,
    personaDescription: bot.persona_description || bot.personaDescription,
    personaPhotoPath: bot.persona_photo_path || bot.personaPhotoPath,
    serviceName: bot.service_name || bot.serviceName,
    serviceDescription: bot.service_description || bot.serviceDescription,
    serviceCategory: bot.service_category || bot.serviceCategory,
    prompt: bot.prompt,
    mcpServices: bot.mcp_services || bot.mcpServices || [],
    ragFiles: bot.rag_files || bot.ragFiles || [],
    publicUrl: bot.public_url || bot.publicUrl,
    releaseName: bot.release_name || bot.releaseName,
    deploymentStatus: bot.deployment_status || 'draft',
    lastPublishedAt: bot.last_published_at,
    deploymentNotes: bot.deployment_notes,
    createdAt: bot.created_at,
    updatedAt: bot.updated_at
  };

  store.bots.push(nextBot);
  writeStore(store);
  return nextBot;
}

export function updateBot(botId, userId, changes) {
  const store = readStore();
  const botIndex = store.bots.findIndex((bot) => bot.id === botId && bot.userId === userId);

  if (botIndex === -1) {
    return null;
  }

  store.bots[botIndex] = {
    ...store.bots[botIndex],
    ...changes,
    updatedAt: new Date().toISOString()
  };

  writeStore(store);
  return store.bots[botIndex];
}
