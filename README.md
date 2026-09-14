![CI](https://github.com/VishalGawale/devcollab/actions/workflows/ci.yml/badge.svg)
# DevCollab: GitHub repository sync and WebSocket connection-status dashboard

DevCollab is a full-stack developer-tooling application that centralises GitHub authentication, repository synchronisation, and connection-status visibility in one dashboard.

It demonstrates OAuth integration, JWT-based session handling, external API integration, PostgreSQL persistence, native WebSocket communication, Docker Compose-based local environments, and GitHub Actions build validation.

*(Screenshot: real dashboard showing synced repositories)*

![Dashboard Screenshot](docs/DevCollab_Dashboard.png)

## Tech Stack

| Technology | Version / role | Why |
| --- | --- | --- |
| React + Vite | React 19.2, Vite 7.3 | React provides the dashboard UI; Vite provides the development server and client build. |
| Fastify | 5.7 | Plugin-based HTTP server with low abstraction overhead and strong TypeScript support. |
| TypeScript | 5.9, strict mode | Strict typing helps catch integration errors across frontend, backend, Prisma, and API payloads. |
| Prisma | 5.22 | Typed database access and migration support for the PostgreSQL data model. |
| PostgreSQL | 16 Alpine in Docker | Relational persistence for users, teams, and repositories, with database constraints. |
| Native WebSocket | `@fastify/websocket` 11.2 and browser WebSocket | Lightweight connection-status and welcome/echo messaging without Socket.IO. |
| GitHub OAuth/API | `@fastify/oauth2` 8.2 | OAuth avoids password storage; the GitHub API supplies account and repository data for synchronisation. |
| Docker Compose | Local development and integration environment | Reproducible startup for the frontend, backend, and PostgreSQL services. |
| GitHub Actions | CI build validation | Installs dependencies, generates Prisma Client, builds both applications, and verifies Docker image builds. |

## Architecture

```text
Browser
  |
  | React/Vite HTTP + native WebSocket
  v
Fastify backend
  |-- GitHub OAuth and GitHub API
  |-- JWT session validation
  |-- Native WebSocket endpoint: /ws/updates
  |
  `--> PostgreSQL (users, teams, repositories)
```

The OAuth flow starts at GET /github, returns through
GET /github/callback, creates or updates a local user, and returns a signed
JWT session token to the frontend for authenticated API requests.

## Features

- GitHub OAuth login and callback handling.
- JWT session tokens and a protected `/me` endpoint.
- Development-only login for local testing; not intended for hosted use.
- GitHub account detection for personal users and organisations.
- Repository synchronisation for personal GitHub accounts and organisations.
- PostgreSQL persistence for users, teams, and synchronised repositories.
- Repository dashboard with refresh, synchronisation, metadata, and GitHub links.
- Native WebSocket connection-status and welcome/echo messages.
- GitHub Actions CI for dependency installation, Prisma Client generation, application builds, and Docker image-build verification.
- Docker Compose workflow for the frontend, backend, and PostgreSQL services.

The current WebSocket implementation reports connection and message status. It
does not yet stream GitHub Actions or CI events.

## Quick Start

### Prerequisites

- Node.js 20+
- Docker Compose
- A GitHub OAuth App with a callback URL matching the backend configuration

### Setup

Docker Compose starts the entire stack—PostgreSQL, Redis, backend, and frontend—with
one command. This is a meaningful improvement over the previous manual
multi-terminal setup.

```bash
git clone <repo>
cd devcollab
copy apps\backend\.env.example apps\backend\.env
```

Fill in the required values in `apps\backend\.env` before starting the stack:

- `DATABASE_URL`: PostgreSQL pooled connection string.
- `DATABASE_URL_UNPOOLED`: direct PostgreSQL connection string used by Prisma migrations.
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `FRONTEND_URL`: frontend URL used for OAuth redirects and CORS.
- `JWT_SECRET`

For local Docker development, use:

```env
GITHUB_CALLBACK_URL=http://localhost:3002/github/callback
FRONTEND_URL=http://localhost:5173
```

Then build and start everything:

```bash
docker-compose up -d --build
docker-compose exec backend npx prisma migrate deploy
```

Open `http://localhost:5173`.

The optional Adminer database UI is available with:

```bash
docker-compose --profile tools up -d
```

Then visit `http://localhost:8080`.

### Local development without Docker

Docker rebuilds are slower for iterative coding. For hot-reload development,
run the backend and frontend separately:

```bash
cd apps\backend
npm install
npx prisma migrate dev
npm run dev
```

```bash
cd apps\frontend
npm install
npm run dev
```

The backend uses `ts-node-dev` for hot reload and the frontend uses the Vite
development server at `http://localhost:5173`. If you configure the frontend
environment explicitly, set `VITE_API_URL=http://localhost:3002` in
`apps\frontend\.env`; when omitted, the frontend uses that URL as its local
development fallback.

## Roadmap

### Done

- GitHub OAuth login and JWT sessions.
- WebSocket connection-status dashboard.
- Prisma/PostgreSQL data model and repository persistence.
- GitHub personal-account and organisation repository synchronisation.
- Docker Compose local environment for the frontend, backend, and PostgreSQL.
- GitHub Actions build validation for both applications.
- Docker image-build verification.

### Planned

- Automated unit and integration tests.
- GitHub Actions or CI-event ingestion.
- Live CI status updates in the dashboard.
- Kubernetes deployment.
- Terraform/IaC.
- GitOps workflows.
- Production-style metrics, logging, and alerting.
- Optional Redis-backed caching or coordination if future requirements justify it.
