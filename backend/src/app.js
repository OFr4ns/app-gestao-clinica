import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { csrfProtection } from './middlewares/csrfProtection.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiRoutes } from './routes/index.js';

export const app = express();

app.use(helmet());
app.use(cors({
  origin: env.frontendOrigin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser(env.security.sessionSecret));
app.use(csrfProtection);

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
