import { FastifyInstance } from "fastify";
import { GitHubService } from "../services/github";

interface SessionPayload {
  githubToken?: string;
}

async function getGitHubToken(request: {
  jwtVerify: () => Promise<unknown>;
  user: unknown;
}) {
  await request.jwtVerify();
  const { githubToken } = request.user as SessionPayload;

  if (!githubToken) {
    throw new Error("GitHub token missing from session");
  }

  return githubToken;
}

export async function githubRoutes(app: FastifyInstance) {
  app.get("/test", async (request, reply) => {
    try {
      const token = await getGitHubToken(request);
      const github = new GitHubService(token);
      return github.getUser();
    } catch (error) {
      reply.status(500);
      return { error: "Failed", message: (error as Error).message };
    }
  });

  app.get("/orgs", async (request, reply) => {
    try {
      const token = await getGitHubToken(request);
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
      const token = await getGitHubToken(request);
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
