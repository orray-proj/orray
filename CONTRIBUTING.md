# Contributing to Orray

## Quick start

<details>
<summary>Prerequisites & installation</summary>

| Tool | Version | Install guide |
|------|---------|---------------|
| Go | 1.24.6+ | [go.dev/doc/install](https://go.dev/doc/install) |
| Docker | latest | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| Tilt | 0.30+ | [docs.tilt.dev/install](https://docs.tilt.dev/install.html) |
| Kind | latest | [kind.sigs.k8s.io](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) |
| Helm | latest | [helm.sh/docs/intro/install](https://helm.sh/docs/intro/install/) |
| Kubectl | latest | [kubernetes.io/docs/tasks/tools](https://kubernetes.io/docs/tasks/tools/) |
| Bun | latest | [bun.sh/docs/installation](https://bun.sh/docs/installation) |

</details>

Create a local Kind cluster:
```bash
make dev-cluster-up
```

Start the dev environment:
```bash
tilt up
```

## Project structure

| Directory | What | Stack |
|-----------|------|-------|
| `api/` | CRD types and definitions | Go |
| `cmd/` | Application entrypoints | Go |
| `pkg/` | Go packages and logic | Go |
| `charts/` | Helm chart for Orray | YAML |
| `docs/` | Documentation site | Next.js + Fumadocs |
| `ui/` | Frontend SPA | Vite + React |

## Commands

All make targets are prefixed by area, run `make help` to list them.

| Prefix | When to use | Example |
|--------|-------------|---------|
| `go-` | Working on Go code (`api/`, `cmd/`, `pkg/`) | `make go-test`, `make go-lint` |
| `ui-` | Working on the frontend (`ui/`) | `make ui-dev`, `make ui-lint` |
| `docs-` | Working on the docs site (`docs/`) | `make docs-dev`, `make docs-lint` |
| `gen-` | After changing CRDs, API annotations, or Helm values | `make generate` (runs all), or `make gen-crds` |
| `dev-` | Managing the local Kind cluster | `make dev-cluster-up`, `make dev-cluster-down` |
| `docker-` | Building the container image | `make docker-build` |

To run across all areas use the aggregates:

- `make lint`
- `make test`
- `make build`

## Branching & PRs

Use a feature branch and open a PR. Before pushing, run lint and tests for the areas you changed.
