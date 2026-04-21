import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { Router } from "express";
import { authenticateRequest } from "../lib/auth.js";
import { env } from "../lib/env.js";
import { ensureDir, sizeLabel } from "../lib/fs.js";

ensureDir(env.uploadDir);

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, env.uploadDir),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({ storage });

export const uploadRouter = Router();

uploadRouter.post("/", authenticateRequest, upload.array("files", 10), (request, response) => {
  const files = (request.files || []).map((file) => ({
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    sizeLabel: sizeLabel(file.size),
    url: `/uploads/${file.filename}`
  }));

  response.status(201).json({ files });
});
