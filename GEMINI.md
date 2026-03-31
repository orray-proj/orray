# Orray Project Context

Orray is a spatial interface for Kubernetes-based platforms. It transforms standard Kubernetes dashboards into a navigable, visual canvas for understanding and operating distributed systems.

## Project Overview

- **Core Mission**: Visualize Kubernetes resources in a spatial layout (canvas), trace requests visually, diff environments in 3D, and act on infrastructure directly.
- **Main Technologies**:
  - **Backend**: Go (v1.25+), Gin (REST API), Cobra (CLI), Controller-runtime (Kubernetes Controller/CRDs).
  - **Frontend**: Vite, React 19, Tailwind CSS 4, `@xyflow/react` (React Flow) for canvas, TanStack Router/Query, Zustand.
  - **Docs**: Next.js, Fumadocs.
  - **Infrastructure**: Kubernetes, Helm, Tilt (for local dev), Kind (local clusters), Docker.

## Project Structure

- `api/`: Kubernetes Custom Resource Definitions (CRDs) and Go types (`v1alpha1`).
- `cmd/controlplane/`: Entry points for core services (`apiserver`, `controller`, `kubernetes-webhooks`).
- `pkg/`: Core Go logic, including:
  - `controller/`: Kubernetes reconciliation logic.
  - `rest/`: API server implementation and routing.
  - `webhook/`: Admission webhooks.
  - `ui/`: Embedded frontend assets (built from `ui/` directory).
- `ui/`: React frontend source code.
- `docs/`: Next.js documentation source code.
- `charts/orray/`: Helm chart for deploying Orray.
- `hack/`: Development scripts, Kind cluster configurations, and boilerplate templates.

## Development Workflow

### Prerequisites
- Go 1.25+
- Docker
- Tilt & Kind (for local clusters)
- Helm & Kubectl
- Bun (for frontend and docs)

### Key Commands
- **Local Dev**:
  - `make dev-cluster-up`: Spin up a local Kind cluster.
  - `tilt up`: Start the development environment with live-reload (deploys to Kind).
- **Codegen**:
  - `make generate`: Run all code generation (CRDs, DeepCopy, OpenAPI, UI client).
  - `make gen-crds`: Specifically update CRD definitions in `charts/`.
  - `make gen-ui`: Update the Orval-generated UI client from the backend OpenAPI spec.
- **Testing & Linting**:
  - `make test`: Run Go and UI tests.
  - `make lint`: Run all linters (GolangCI-Lint, Biome).
  - `make lint-fix`: Automatically fix linting issues where possible.
- **Building**:
  - `make build`: Build the Go controlplane binary.
  - `make ui-build`: Build the frontend and copy to `pkg/ui/dist`.

## Coding Conventions

- **Backend**: Standard Go practices with `controller-runtime` patterns. APIs are documented using Swagger/OpenAPI annotations in `pkg/rest/router.go`.
- **Frontend**: React 19 with functional components. Styling is exclusively Tailwind CSS 4. Uses Biome for formatting and linting.
- **Version Control**: Feature branches and PRs. Ensure `make lint` and `make test` pass before pushing.
- **CRDs**: Any change to `api/v1alpha1` types requires running `make generate` to sync CRD manifests and DeepCopy methods.
