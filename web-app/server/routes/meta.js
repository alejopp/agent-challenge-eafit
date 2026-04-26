import { Router } from 'express';
import { MCP_SERVICES } from '../services/catalog.js';

export function metaRouter(config) {
  const router = Router();

  router.get('/config', (_req, res) => {
    return res.json({
      namespace: config.k8sNamespace,
      baseDomain: config.baseAgentDomain,
      ollamaModel: config.ollamaModel,
      helmDeployEnabled: config.enableHelmDeploy,
      llmProvider: config.llmProvider,
      sharedPostgresHost: config.sharedPostgresHost,
      sharedRedisUrl: config.sharedRedisUrl
    });
  });

  router.get('/mcp-services', (_req, res) => {
    return res.json({ services: MCP_SERVICES });
  });

  return router;
}
