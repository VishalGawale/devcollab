# ADR 001: Use Fastify for the Backend HTTP Server

## Status

Accepted

## Context

DevCollab needs a TypeScript-first HTTP server for OAuth, JWT-protected routes,
GitHub API integration, and WebSocket support. Express was the main alternative
because of its larger ecosystem and familiarity. The decision also needed to
support a plugin-oriented backend, reasonable request performance, and clear
composition of cross-cutting concerns such as CORS, Helmet, rate limiting, JWT,
OAuth2, and WebSockets.

## Decision

Use Fastify 5.7 with TypeScript. The server in
`apps/backend/src/server.ts` composes `@fastify/cors`, `@fastify/helmet`,
`@fastify/rate-limit`, `@fastify/jwt`, and `@fastify/websocket` as plugins.
Fastify's encapsulated plugin model keeps route groups such as `authRoutes`,
`githubRoutes`, and `repositoryRoutes` independently registerable, while its
lower-overhead request lifecycle fits this API better than adding Express
middleware layers. Fastify also provides first-class TypeScript types for
requests, replies, and plugin registration.

## Consequences

Positive consequences include a compact server composition, typed route
handlers, and direct integration of OAuth, JWT, and native WebSocket plugins.
The plugin registration order is explicit, which helped ensure JWT is available
before `/me` and other protected handlers.

The tradeoffs are a smaller ecosystem and fewer Express-compatible examples.
Team members must understand Fastify's plugin encapsulation and registration
order, and some third-party middleware may require Fastify-specific adapters.
