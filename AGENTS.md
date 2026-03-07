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

All internal documentation lives in Notion. Use the Notion MCP tools to search and read it.

## currentDate

Today's date is 2026-03-07.
