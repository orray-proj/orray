# Orray

Kubernetes controller (Go) with a React SPA frontend (`ui/`) and Next.js docs site (`docs/`).

## Package managers

- **Go backend**: `go` (with `make` targets)
- **JS (ui, docs)**: `bun`

## Workflow

- **After every code change**: Run lint, tests, and CodeRabbit review (`/coderabbit:review`) before considering the task done.
- **Backend**: `make lint && make test`
- **UI**: See [`ui/CLAUDE.md`](ui/CLAUDE.md)
- **Docs**: See [`docs/CLAUDE.md`](docs/CLAUDE.md)

## Internal docs

Product specs, feature requirements, API schema, architectural decisions, and competitive analysis live in Notion. Use the Notion MCP tools to search for context before starting work on a feature or design decision.

## Domain decisions and PMP handoff

- Before settling or revisiting a high-cost decision involving unfamiliar domain constraints, use `domain-reconnaissance`. Treat its packet as shaping input; align affected decisions, specs, and tickets before implementation resumes.
- Keep reconnaissance, decisions, implementation, and operational evidence in this repo.
- When a project issue links a Personal Mastery Program Learning Cycle, post an `## Assessment handoff` comment to the linked PMP issue when its evidence target is ready. Include project issue, evidence links, decisions and constraints, validation, known limits, and unresolved questions. Add the PMP issue's `ready-for-agent` label. PMP owns the capability assessment.
- If the cross-repo write is unavailable, return the exact handoff comment and mark the handoff blocked; the cycle is not ready for assessment yet.
