import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import oauth2 from "@fastify/oauth2";
import jwt from "@fastify/jwt";
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
  // Register JWT
  await app.register(jwt, {
    secret: config.session.jwtSecret,
  });

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
    startRedirectPath: "/auth/github",
    callbackUri: config.github.callbackUrl,
    scope: ["read:user", "user:email"],
  });

  // Handle callback
  app.get(
    "/auth/github/callback",
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
            Authorization: `Bearer ${accessToken}`,
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
        reply.redirect(`http://localhost:3000/auth/callback?token=${jwtToken}`);
      } catch (error) {
        console.error("OAuth error:", error);
        reply.redirect("http://localhost:3000/auth/error");
      }
    },
  );

  // Protected route example
  app.get("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const { userId } = request.user as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        reply.status(404);
        return { error: "User not found" };
      }

      return user;
    } catch (err) {
      reply.status(401);
      return { error: "Unauthorized" };
    }
  });
}
