import { Router } from 'express';
import { pingDatabase } from '../db/pool.js';

export const healthRoutes = Router();

healthRoutes.get('/health', async (req, res, next) => {
  try {
    const database = await pingDatabase();

    res.json({
      status: 'ok',
      database: database ? 'ok' : 'unavailable',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

