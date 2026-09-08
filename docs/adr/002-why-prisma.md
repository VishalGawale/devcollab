# ADR 002: Use Prisma for Database Access

## Status

Accepted

## Context

DevCollab needs type-safe persistence for the `User`, `Team`, and `Repository`
models defined in `apps/backend/prisma/schema.prisma`, including unique GitHub
identifiers and the Team-to-Repository relation. Raw SQL would provide maximum
query control but require manually maintained result types. TypeORM and Drizzle
were considered as alternatives; both can provide typed access, but the project
needed a generated client that directly reflects the schema and a straightforward
migration workflow.

## Decision

Use Prisma 5.22 and `@prisma/client`. The schema is the source of truth, and
`npx prisma generate` produces the TypeScript client used through the singleton
in `apps/backend/src/utils/prisma.ts`. The project uses `prisma migrate dev`
for local schema changes. Prisma's `upsert()` is used in
`apps/backend/src/routes/auth.ts` for users and extensively in
`apps/backend/src/services/github.ts` to synchronize repositories by
`githubId`, matching the insert-or-update behavior required by GitHub sync.

## Consequences

Prisma gives repository and user operations generated types, enforces schema
constraints in the client, and makes repeated upsert logic concise. The
generated client also keeps database access aligned with the actual
User/Team/Repository fields.

The tradeoffs are an additional client-generation step in development and CI,
plus a dependency on Prisma's generated artifacts. Prisma is less flexible than
raw SQL for complex or database-specific queries, so future reporting queries
may need carefully scoped raw SQL rather than relying only on the generated
client.
