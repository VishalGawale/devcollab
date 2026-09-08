import { FastifyInstance } from "fastify";
import { GitHubService } from "../services/github";

export async function githubRoutes(app: FastifyInstance) {
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

  app.get("/orgs", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        reply.status(401);
        return { error: "No authorization header" };
      }

      const token = authHeader.replace("Bearer ", "");
      const github = new GitHubService(token);
      return github.getOrganizations();
    } catch (error) {
      reply.status(500);
      return {
        error: "Failed to fetch organizations",
        message: (error as Error).message,
      };
    }
  });

  app.post("/sync/:org", async (request, reply) => {
    const { org } = request.params as { org: string };
    app.log.info({ org }, "Starting GitHub sync for org");

    try {
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
        status: "ok",
        org,
        message: `Synced ${repos.length} repositories`,
        count: repos.length,
      };
    } catch (error) {
      app.log.error(error, "Failed to sync GitHub org");
      reply.status(500);
      return { error: "Sync failed", message: (error as Error).message };
    }
  });
}
