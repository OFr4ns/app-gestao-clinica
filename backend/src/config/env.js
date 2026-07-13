import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'gestao_clinica',
    user: process.env.DB_USER || 'gestao_app',
    password: process.env.DB_PASSWORD || 'gestao_app_password'
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'development-only-secret',
    encryptionKey: process.env.APP_ENCRYPTION_KEY || '',
    hashKey: process.env.APP_HASH_KEY || '',
    sessionTtlHours: Number(process.env.SESSION_TTL_HOURS || 8)
  }
};
