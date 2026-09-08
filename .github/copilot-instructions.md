# DevCollab — Copilot Project Instructions

## Stack

- Monorepo: apps/backend (Fastify + TypeScript + Prisma + PostgreSQL) and apps/frontend (React 18 + Vite + TypeScript)
- Real-time: Socket.IO shared on the same Fastify HTTP server (port 3002)
- Auth: GitHub OAuth 2.0 via @fastify/jwt, JWT sessions, token in Authorization: Bearer header
- Local dev: docker-compose provides Postgres :5432 and Redis :6379

## Conventions (MUST follow)

- TypeScript strict mode everywhere. NEVER use `any` — define interfaces/types instead.
- Backend style: double quotes, semicolons, 2-space indent (match existing files)
- Route pattern: route handlers in src/routes/, business logic in src/services/, prisma singleton from src/utils/prisma.ts
- Fastify plugins registered with prefixes in server.ts; root-level routes (like /me, /health) registered BEFORE prefixed plugins
- Commits: Conventional Commits (feat:, fix:, docs:, chore:)

## Hard rules

- NEVER commit or print real secrets. .env files are gitignored; .env.example must contain placeholders only.
- Do not add new dependencies without asking first.
- After any backend code change, verify with `npx tsc --noEmit` in apps/backend.
- Do not modify prisma/schema.prisma without asking first.
