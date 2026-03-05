# Contributing

## Prerequisites

- Go
- [Bun](https://bun.sh/)

## Project Structure

| Directory | What | Stack |
|-----------|------|-------|
| `cmd/` | Entrypoints | Go |
| `pkg/` | Go packages | Go |
| `api/` | CRD types | Go |
| `charts/` | Helm chart | YAML |
| `docs/` | Documentation site | Next.js |
| `ui/` | Frontend SPA | Vite + React |

## Development

### Backend

```bash
make build          # build binary
make test           # run tests
make lint           # golangci-lint
```

### Frontend (UI)

```bash
make ui-dev         # dev server on :5173
make ui-build       # production build
make ui-lint        # biome check
make ui-types       # typecheck
```

### Docs

```bash
cd docs && bun dev  # dev server
bunx ultracite check # lint
```

### Docker

```bash
make build-image    # full image with UI baked in
```

## Branching

Push directly to `main` if nobody else is pushing at the same time. For larger changes or when collaborating, use a feature branch and open a PR.

## Before Pushing

1. Run lint and tests for the areas you changed
2. Make sure the build passes
3. Review with CodeRabbit (`/coderabbit:review`)
