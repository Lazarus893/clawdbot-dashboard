import { Router } from 'express';
import { clawdbotClient } from '../clawdbot-client.js';

export const agentsRouter = Router();

agentsRouter.get('/overview', async (req, res) => {
  try {
    const overview = await clawdbotClient.getAgentsOverview();
    res.json(overview);
  } catch (error) {
    console.error('Failed to get agents overview:', error);
    res.status(500).json({ error: 'Failed to fetch agents overview' });
  }
});
