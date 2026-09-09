# ADR 003: Use Docker Compose Before Kubernetes

## Status

Accepted

## Context

DevCollab needs a consistent way to run and demonstrate the full stack locally,
including the backend, frontend, PostgreSQL, and Redis. Kubernetes was considered
as a target for a later phase, but the current project does not yet justify the
complexity of cloud infrastructure, ongoing cost, and additional operational
surface area.

## Decision

Use Docker Compose for local development and demonstration at this stage. The
backend and frontend use multi-stage Dockerfiles, while Compose wires them to
the PostgreSQL and Redis services with health-aware startup dependencies. Scope
Kubernetes, Terraform/IaC, and GitOps as a documented future phase rather than
implementing them now.

## Consequences

Compose enables fast local iteration, zero cloud cost, and low operational risk.
It still demonstrates containerization competency through multi-stage images and
CI builds for both application images.

The honest tradeoff is that Docker Compose does not demonstrate orchestration,
autoscaling, or broader cloud-native deployment patterns. Those capabilities
remain a genuine gap compared with a production Kubernetes deployment and will
need to be addressed if the project moves to a production-scale environment.
