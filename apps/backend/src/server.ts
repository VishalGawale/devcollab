import Fastify from 'fastify';
import { prisma } from './utils/prisma';
import { userRoutes } from './routes/users';

const app = Fastify({ logger: true });

// Health checks
app.get('/health', async () => ({ 
  status: 'ok',
  timestamp: new Date().toISOString() 
}));

app.get('/health/db', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  } catch (error) {
    return { status: 'error', database: 'disconnected' };
  }
});

// API Routes
app.register(userRoutes, { prefix: '/users' });

app.listen({ port: 3002, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Server running at http://localhost:3002');
  console.log('Routes: /health, /health/db, /users');
});
