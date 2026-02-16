import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';

export async function userRoutes(app: FastifyInstance) {
  // GET /users - List all users
  app.get('/', async () => {
    return prisma.user.findMany();
  });

  // POST /users - Create user
  app.post('/', async (request, reply) => {
    const { email, name, githubId, username } = request.body as any;
    
    const user = await prisma.user.create({
      data: { email, name, githubId, username }
    });
    
    reply.status(201);
    return user;
  });

  // GET /users/:id - Get single user
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      reply.status(404);
      return { error: 'User not found' };
    }
    
    return user;
  });
}
