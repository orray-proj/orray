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
