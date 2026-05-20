import { Router } from 'express';
import { getDashboardMetrics } from '../services/metrics.js';

export function statsRouter(config) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const hybridMetrics = getDashboardMetrics(config);
      
      let messagesData = [];
      try {
        const response = await fetch(config.statisticsApiUrl, {
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            messagesData = data;
          }
        } else {
          console.warn(`[Stats API] Endpoint returned ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.warn(`[Stats API] Error fetching statistics from ${config.statisticsApiUrl}: ${err.message}`);
      }

      return res.json({
        ...hybridMetrics,
        messagesData
      });
    } catch (error) {
      console.error(`[Stats API] Unexpected error: ${error.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
