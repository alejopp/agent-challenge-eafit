import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import { env } from "./lib/env.js";
import { ensureDir } from "./lib/fs.js";
import "./lib/db.js";
import { authRouter } from "./routes/authRoutes.js";
import { platformRouter } from "./routes/platformRoutes.js";
import { uploadRouter } from "./routes/uploadRoutes.js";
import { botRouter } from "./routes/botRoutes.js";
import { handleWeatherMcp } from "./mcp/weatherMcp.js";
import { handleWikipediaMcp } from "./mcp/wikipediaMcp.js";

ensureDir(env.uploadDir);
ensureDir(env.generatedDir);

const app = express();
const clientDist = path.resolve(process.cwd(), "client/dist");

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(env.uploadDir));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/platform", platformRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api", botRouter);

function createMcpHandler(handler) {
  return async (request, response) => {
    try {
      const result = await handler(request.body);
      response.json({
        jsonrpc: "2.0",
        id: request.body?.id ?? null,
        result
      });
    } catch (reason) {
      response.status(500).json({
        jsonrpc: "2.0",
        id: request.body?.id ?? null,
        error: {
          code: -32000,
          message: reason.message
        }
      });
    }
  };
}

app.post("/mcp/weather", createMcpHandler(handleWeatherMcp));
app.post("/mcp/wikipedia", createMcpHandler(handleWikipediaMcp));

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api") || request.path.startsWith("/mcp")) {
      return next();
    }
    response.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(env.port, () => {
  console.log(`Persona AI Studio running at http://localhost:${env.port}`);
});
