import { Router } from 'express';
import { clawdbotClient } from '../clawdbot-client.js';

export const cronRouter = Router();

cronRouter.get('/list', async (req, res) => {
  try {
    const jobs = await clawdbotClient.listCronJobs();
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cron jobs' });
  }
});

cronRouter.post('/update/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const patch = req.body;
    const success = await clawdbotClient.updateCronJob(jobId, patch);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cron job' });
  }
});

cronRouter.post('/run/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const success = await clawdbotClient.runCronJob(jobId);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run cron job' });
  }
});
