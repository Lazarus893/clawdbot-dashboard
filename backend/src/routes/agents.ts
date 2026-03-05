import { Router } from 'express';
import { openclawClient, ccpsClient } from '../openclaw-client.js';

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

agentsRouter.get('/ccps/list', async (_req, res) => {
  try {
    const providers = await ccpsClient.listProviders();
    res.json({ providers });
  } catch (error) {
    console.error('Failed to list ccps providers:', error);
    res.status(500).json({ error: 'Failed to list providers' });
  }
});

agentsRouter.post('/ccps/use', async (req, res) => {
  try {
    const { nameOrId } = req.body;
    if (!nameOrId) {
      res.status(400).json({ error: 'Missing nameOrId' });
      return;
    }
    const result = await ccpsClient.useProvider(nameOrId);
    res.json(result);
  } catch (error) {
    console.error('Failed to switch ccps provider:', error);
    res.status(500).json({ error: 'Failed to switch provider' });
  }
});
