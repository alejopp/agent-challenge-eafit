import { Router } from "express";
import { authenticateRequest } from "../lib/auth.js";
import { getPlatformConfig } from "../services/platformService.js";

export const platformRouter = Router();

platformRouter.get("/config", authenticateRequest, (_request, response) => {
  response.json(getPlatformConfig());
});
