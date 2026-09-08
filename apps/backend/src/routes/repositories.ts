import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';

export async function repositoryRoutes(app: FastifyInstance) {
  // GET /repositories - List all repositories
  app.get('/', async (request, reply) => {
    try {
      const repos = await prisma.repository.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      return repos;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      reply.status(500);
      return { error: 'Failed to fetch repositories' };
    }
  });

  // GET /repositories/:id - Get single repository
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const repo = await prisma.repository.findUnique({
      where: { id }
    });
    if (!repo) {
      reply.status(404);
      return { error: 'Repository not found' };
    }
    return repo;
  });
}
