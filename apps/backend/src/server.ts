import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import jwt from "@fastify/jwt";
import { config } from "./config";
import { prisma } from "./utils/prisma";
import { userRoutes } from "./routes/users";
import { authRoutes } from "./routes/auth";
import { githubRoutes } from "./routes/github";
import { repositoryRoutes } from "./routes/repositories";
import { websocketRoutes } from "./routes/websocket";

const app = Fastify({ logger: true });

async function start() {
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: config.frontendUrl,
    credentials: true,
  });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await app.register(websocket);

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  app.get("/health/db", async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ok", database: "connected" };
    } catch (error) {
      return { status: "error", database: "disconnected" };
    }
  });

  // Register JWT before routes that call request.jwtVerify().
  await app.register(jwt, { secret: config.session.jwtSecret });

  // Keep root-level routes before prefixed route plugins.
  app.get("/me", async (request, reply) => {
    try {
      await request.jwtVerify();
      const { userId } = request.user as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        reply.status(404);
        return { error: "User not found" };
      }

      return user;
    } catch (error) {
      reply.status(401);
      return { error: "Unauthorized" };
    }
  });

  await app.register(userRoutes, { prefix: "/users" });
  await app.register(authRoutes);
  await app.register(githubRoutes, { prefix: "/github" });
  await app.register(repositoryRoutes, { prefix: "/repositories" });
  await app.register(websocketRoutes);

  await app.listen({ port: config.port, host: config.host });
  app.log.info(`Server running at http://${config.host}:${config.port}`);
}

start().catch((error) => {
  app.log.error(error);
  process.exit(1);
});
