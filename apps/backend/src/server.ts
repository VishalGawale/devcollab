import Fastify from 'fastify';
import { prisma } from './utils/prisma';
import { userRoutes } from './routes/users';
import { authRoutes } from './routes/auth';

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
app.register(authRoutes);

app.listen({ port: 3002, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Server running at http://localhost:3002');
  console.log('Routes:');
  console.log('  GET  /health');
  console.log('  GET  /health/db');
  console.log('  GET  /users');
  console.log('  POST /users');
  console.log('  GET  /auth/github         - Start GitHub login');
  console.log('  GET  /auth/github/callback - GitHub callback');
  console.log('  GET  /me                  - Get current user (requires auth)');
});
