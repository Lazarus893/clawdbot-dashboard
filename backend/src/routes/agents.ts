import { Router } from 'express';
import { openclawClient } from '../openclaw-client.js';

export const agentsRouter = Router();

agentsRouter.get('/overview', async (req, res) => {
  try {
    const overview = await openclawClient.getAgentsOverview();
    res.json(overview);
  } catch (error) {
    console.error('Failed to get agents overview:', error);
    res.status(500).json({ error: 'Failed to fetch agents overview' });
  }
});
