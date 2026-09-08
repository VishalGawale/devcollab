import { FastifyInstance } from "fastify";
import { GitHubService } from "../services/github";

export async function githubRoutes(app: FastifyInstance) {
  // GET /github/test - Simple test
  app.get("/test", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        reply.status(401);
        return { error: "No authorization header" };
      }

      const token = authHeader.replace("Bearer ", "");
      const github = new GitHubService(token);
      return github.getUser();
    } catch (error) {
      reply.status(500);
      return { error: "Failed", message: (error as Error).message };
    }
  });

  // GET /github/orgs - List organizations
  app.get("/orgs", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        reply.status(401);
        return { error: "No authorization header" };
      }

      const token = authHeader.replace("Bearer ", "");
      const github = new GitHubService(token);

      const orgs = await github.getOrganizations();
      return orgs;
    } catch (error) {
      reply.status(500);
      return {
        error: "Failed to fetch organizations",
        message: (error as Error).message,
      };
    }
  });

  // POST /github/sync/:org - Sync repositories
  app.post("/sync/:org", async (request, reply) => {
    try {
      const { org } = request.params as { org: string };

      const authHeader = request.headers.authorization;
      if (!authHeader) {
        reply.status(401);
        return { error: "No authorization header" };
      }

      const token = authHeader.replace("Bearer ", "");
      const github = new GitHubService(token);

      const repos = await github.syncRepositories(org, "placeholder-team-id");

      reply.status(201);
      return {
        message: `Synced ${repos.length} repositories from ${org}`,
        count: repos.length,
      };
    } catch (error) {
      reply.status(500);
      return { error: "Failed to sync", message: (error as Error).message };
    }
  });
}
