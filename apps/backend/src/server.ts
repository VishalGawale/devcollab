import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { config } from './config';
import { prisma } from './utils/prisma';
import { userRoutes } from './routes/users';
import { authRoutes } from './routes/auth';
import { githubRoutes } from './routes/github';

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

app.register(jwt, { secret: config.session.jwtSecret });

app.get('/me', async (request, reply) => {
  try {
    await request.jwtVerify();
    const { userId } = request.user as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      reply.status(404);
      return { error: 'User not found' };
    }

    return user;
  } catch (error) {
    reply.status(401);
    return { error: 'Unauthorized' };
  }
});

// API Routes
app.register(userRoutes, { prefix: '/users' });
app.register(authRoutes);
app.register(githubRoutes, { prefix: '/github' });

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
  console.log('  GET  /auth/github');
  console.log('  GET  /auth/github/callback');
  console.log('  GET  /me');
  console.log('  GET  /github/orgs          - List GitHub organizations');
  console.log('  POST /github/sync/:org     - Sync repositories from org');
});
