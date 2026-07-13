import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getDashboard, getReports } from '../services/dashboardService.js';

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get('/dashboard', async (req, res, next) => {
  try {
    const dashboard = await getDashboard({
      psychologistId: req.auth.psychologistId
    });

    res.json({ dashboard });
  } catch (err) {
    next(err);
  }
});

dashboardRoutes.get('/reports', async (req, res, next) => {
  try {
    const reports = await getReports({
      psychologistId: req.auth.psychologistId
    });

    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

