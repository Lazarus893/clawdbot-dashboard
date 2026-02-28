import { Router } from 'express';
import { openclawClient } from '../openclaw-client.js';

export const systemRouter = Router();

systemRouter.get('/status', async (req, res) => {
  try {
    const status = await openclawClient.getSystemStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});
