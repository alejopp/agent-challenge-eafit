import path from "node:path";
import Database from "better-sqlite3";
import { env } from "./env.js";
import { ensureDir } from "./fs.js";

ensureDir(path.dirname(env.dbPath));

export const db = new Database(env.dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bots (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    profession TEXT NOT NULL,
    persona_description TEXT NOT NULL,
    persona_photo_url TEXT DEFAULT '',
    service_name TEXT NOT NULL,
    service_description TEXT NOT NULL,
    service_category TEXT NOT NULL,
    prompt TEXT NOT NULL,
    mcp_servers_json TEXT NOT NULL,
    rag_documents_json TEXT NOT NULL,
    public_url TEXT DEFAULT '',
    generated_bundle_path TEXT DEFAULT '',
    published_at TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_bots_slug_unique ON bots (slug);
`);

export const statements = {
  createUser: db.prepare(`
    INSERT INTO users (id, name, email, password_hash, created_at)
    VALUES (@id, @name, @email, @passwordHash, @createdAt)
  `),
  findUserByEmail: db.prepare(`
    SELECT id, name, email, password_hash AS passwordHash, created_at AS createdAt
    FROM users
    WHERE email = ?
  `),
  findUserById: db.prepare(`
    SELECT id, name, email, created_at AS createdAt
    FROM users
    WHERE id = ?
  `),
  createBot: db.prepare(`
    INSERT INTO bots (
      id, user_id, slug, name, status, profession, persona_description, persona_photo_url,
      service_name, service_description, service_category, prompt, mcp_servers_json,
      rag_documents_json, public_url, generated_bundle_path, published_at, created_at, updated_at
    ) VALUES (
      @id, @userId, @slug, @name, @status, @profession, @personaDescription, @personaPhotoUrl,
      @serviceName, @serviceDescription, @serviceCategory, @prompt, @mcpServersJson,
      @ragDocumentsJson, @publicUrl, @generatedBundlePath, @publishedAt, @createdAt, @updatedAt
    )
  `),
  listBotsByUser: db.prepare(`
    SELECT
      id,
      user_id AS userId,
      slug,
      name,
      status,
      profession,
      persona_description AS personaDescription,
      persona_photo_url AS personaPhotoUrl,
      service_name AS serviceName,
      service_description AS serviceDescription,
      service_category AS serviceCategory,
      prompt,
      mcp_servers_json AS mcpServersJson,
      rag_documents_json AS ragDocumentsJson,
      public_url AS publicUrl,
      generated_bundle_path AS generatedBundlePath,
      published_at AS publishedAt,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM bots
    WHERE user_id = ?
    ORDER BY updated_at DESC
  `),
  findBotById: db.prepare(`
    SELECT
      id,
      user_id AS userId,
      slug,
      name,
      status,
      profession,
      persona_description AS personaDescription,
      persona_photo_url AS personaPhotoUrl,
      service_name AS serviceName,
      service_description AS serviceDescription,
      service_category AS serviceCategory,
      prompt,
      mcp_servers_json AS mcpServersJson,
      rag_documents_json AS ragDocumentsJson,
      public_url AS publicUrl,
      generated_bundle_path AS generatedBundlePath,
      published_at AS publishedAt,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM bots
    WHERE id = ? AND user_id = ?
  `),
  updateBot: db.prepare(`
    UPDATE bots SET
      slug = @slug,
      name = @name,
      profession = @profession,
      persona_description = @personaDescription,
      persona_photo_url = @personaPhotoUrl,
      service_name = @serviceName,
      service_description = @serviceDescription,
      service_category = @serviceCategory,
      prompt = @prompt,
      mcp_servers_json = @mcpServersJson,
      rag_documents_json = @ragDocumentsJson,
      updated_at = @updatedAt
    WHERE id = @id AND user_id = @userId
  `),
  updateBotPublishing: db.prepare(`
    UPDATE bots SET
      status = @status,
      public_url = @publicUrl,
      generated_bundle_path = @generatedBundlePath,
      published_at = @publishedAt,
      updated_at = @updatedAt
    WHERE id = @id AND user_id = @userId
  `),
  deleteBot: db.prepare(`
    DELETE FROM bots
    WHERE id = ? AND user_id = ?
  `)
};

export function mapBotRecord(record) {
  if (!record) return null;
  return {
    ...record,
    mcpServers: JSON.parse(record.mcpServersJson || "[]"),
    ragDocuments: JSON.parse(record.ragDocumentsJson || "[]")
  };
}
