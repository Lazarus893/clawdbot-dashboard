import { Router } from 'express';
import { openclawClient } from '../openclaw-client.js';

export const modelsRouter = Router();

modelsRouter.get('/list', async (_req, res) => {
  try {
    const result = await openclawClient.listModels();
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to list models' });
  }
});

modelsRouter.get('/status', async (_req, res) => {
  try {
    const result = await openclawClient.getModelStatus();
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to get model status' });
  }
});

modelsRouter.post('/set', async (req, res) => {
  const { model } = req.body;
  if (!model || typeof model !== 'string') {
    res.status(400).json({ error: 'Missing model parameter' });
    return;
  }

  const setResult = await openclawClient.setModel(model);
  if (!setResult.success) {
    res.status(500).json({ error: setResult.error || 'Failed to set model' });
    return;
  }

  const restartResult = await openclawClient.restartGateway();
  res.json({
    success: true,
    model,
    gatewayRestarted: restartResult.success,
    gatewayError: restartResult.error,
  });
});
