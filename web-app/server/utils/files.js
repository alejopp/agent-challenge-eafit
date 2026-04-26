import fs from 'node:fs';
import path from 'node:path';

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function ensureAppDirectories(storageDir, generatedDir) {
  ensureDir(storageDir);
  ensureDir(path.join(storageDir, 'uploads'));
  ensureDir(generatedDir);
}

export function safeParseJson(value, fallback = []) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
