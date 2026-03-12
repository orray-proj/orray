# Contributing to Orray

Thank you for your interest in contributing to Orray! This guide will help you set up your development environment and get started.

## Prerequisites

To build and run Orray locally, you need the following tools installed:

- **Go** (v1.24.6+)
- **Docker**
- **Tilt** (v0.30+)
- **Kind** (Kubernetes in Docker)
- **Helm**
- **Kubectl**
- **Bun** (for UI and Docs development)

### Tool Installation Guide

#### 1. Tilt
Tilt helps you develop your services locally on Kubernetes.
- **macOS (Homebrew):** `curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash`
- **Linux:** `curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash`
- **Windows:** `scoop bucket add tilt-dev https://github.com/tilt-dev/scoop-bucket && scoop install tilt`

#### 2. Kind
Kind lets you run Kubernetes clusters locally using Docker container "nodes".
- **macOS/Linux (Homebrew):** `brew install kind`
- **Go:** `go install sigs.k8s.io/kind@latest`
- **Windows (Chocolatey):** `choco install kind`

#### 3. Helm
Helm is the package manager for Kubernetes.
- **macOS (Homebrew):** `brew install helm`
- **Linux/Windows:** Follow the [official installation guide](https://helm.sh/docs/intro/install/).

#### 4. Kubectl
The Kubernetes command-line tool.
- **macOS (Homebrew):** `brew install kubectl`
- **Linux/Windows:** Follow the [official installation guide](https://kubernetes.io/docs/tasks/tools/).

#### 5. Bun
A fast all-in-one JavaScript runtime.
- **macOS/Linux/Windows:** `curl -fsSL https://bun.sh/install | bash`

---

## Local Development Workflow

The recommended way to develop Orray is using **Tilt** with **Kind**.

### 1. Set up your local cluster
We provide a helper in the `Makefile` to create a Kind cluster with the necessary configuration:
```bash
make dev-cluster-up
```

### 2. Start Tilt
Start the development environment by running:
```bash
tilt up
```
Once Tilt is running, you can access the dashboard at `http://localhost:10350`.

---

## Project Structure

| Directory | What | Stack |
|-----------|------|-------|
| `api/` | CRD types and definitions | Go |
| `cmd/` | Application entrypoints | Go |
| `pkg/` | Go packages and logic | Go |
| `charts/` | Helm chart for Orray | YAML |
| `docs/` | Documentation site | Next.js + Fumadocs |
| `ui/` | Frontend SPA | Vite + React |

---

## Commands

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
make docker-build   # full image with UI baked in
```

---

## Branching & Pushing

- Use a feature branch and open a PR for larger changes or collaborative work.

### Before Pushing

1. Run lint and tests for the areas you changed.
2. Make sure the build passes.
3. Review with CodeRabbit (`/coderabbit:review`).

---

## Need Help?
If you have any questions, feel free to open an issue or reach out to the maintainers.
