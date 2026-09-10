import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import oauth2 from "@fastify/oauth2";
import { config } from "../config";
import { prisma } from "../utils/prisma";

// Extend FastifyInstance to include githubOAuth
declare module "fastify" {
  interface FastifyInstance {
    githubOAuth: {
      getAccessTokenFromAuthorizationCodeFlow: (
        request: FastifyRequest,
      ) => Promise<{ token: { access_token: string } }>;
    };
  }
}

interface GitHubUser {
  id: number;
  email: string | null;
  name: string | null;
  login: string;
  avatar_url: string;
}

export async function authRoutes(app: FastifyInstance) {
  // Register OAuth2 for GitHub
  await app.register(oauth2, {
    name: "githubOAuth",
    credentials: {
      client: {
        id: config.github.clientId,
        secret: config.github.clientSecret,
      },
      auth: oauth2.GITHUB_CONFIGURATION,
    },
    startRedirectPath: "/github",
    callbackUri: config.github.callbackUrl,
    scope: ["read:user", "user:email"],
  });

  app.post("/auth/dev-login", async (_request, reply) => {
    if (config.env === "production") {
      reply.status(403);
      return { error: "Dev login is disabled in production" };
    }

    const user = await prisma.user.upsert({
      where: { githubId: "dev-000000" },
      update: {
        email: "dev@localhost",
        name: "Dev User",
        username: "dev-user",
      },
      create: {
        name: "Dev User",
        username: "dev-user",
        email: "dev@localhost",
        githubId: "dev-000000",
      },
    });

    const token = await reply.jwtSign({
      userId: user.id,
      githubToken: "dev-token",
    });

    return { token, user };
  });

  // Handle callback
  app.get(
    "/github/callback",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get token from GitHub
        const result = await (
          app as any
        ).githubOAuth.getAccessTokenFromAuthorizationCodeFlow(request);
        const accessToken = result.token.access_token;

        // Fetch user from GitHub API
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch GitHub user");
        }

        const githubUser: GitHubUser =
          (await userResponse.json()) as GitHubUser;

        // Create or update user in database
        const user = await prisma.user.upsert({
          where: { githubId: String(githubUser.id) },
          update: {
            email: githubUser.email || "",
            name: githubUser.name || githubUser.login,
            avatarUrl: githubUser.avatar_url,
            username: githubUser.login,
          },
          create: {
            githubId: String(githubUser.id),
            email: githubUser.email || "",
            name: githubUser.name || githubUser.login,
            avatarUrl: githubUser.avatar_url,
            username: githubUser.login,
          },
        });

        // Generate JWT token
        const jwtToken = await reply.jwtSign({
          userId: user.id,
          githubToken: accessToken,
        });

        // Redirect to frontend with token
        reply.redirect(
          `${config.frontendUrl}/auth/callback?token=${jwtToken}`,
        );
      } catch (error) {
        console.error("OAuth error:", error);
        reply.redirect(`${config.frontendUrl}/?error=oauth_failed`);
      }
    },
  );
}
