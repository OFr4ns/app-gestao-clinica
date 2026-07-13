import { Router } from 'express';
import { appointmentRoutes } from './appointmentRoutes.js';
import { authRoutes } from './authRoutes.js';
import { adminRoutes } from './adminRoutes.js';
import { clinicalHistoryRoutes } from './clinicalHistoryRoutes.js';
import { dashboardRoutes } from './dashboardRoutes.js';
import { financialRoutes } from './financialRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { importRoutes } from './importRoutes.js';
import { patientRoutes } from './patientRoutes.js';

export const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use(authRoutes);
apiRoutes.use(adminRoutes);
apiRoutes.use(patientRoutes);
apiRoutes.use(appointmentRoutes);
apiRoutes.use(financialRoutes);
apiRoutes.use(clinicalHistoryRoutes);
apiRoutes.use(dashboardRoutes);
apiRoutes.use(importRoutes);
