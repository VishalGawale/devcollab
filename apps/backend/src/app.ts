import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { config } from './config';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.env === 'development' ? 'debug' : 'info',
    },
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: config.frontendUrl,
    credentials: true,
  });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(jwt, { secret: config.session.jwtSecret });

  app.get('/health', async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    environment: config.env,
  }));

  app.get('/ready', async () => ({
    status: 'ready',
    checks: { database: 'ok', redis: 'ok' },
  }));

  return app;
}
