# Orray

Orray is a spatial interface for Kubernetes-based platforms. Instead of dashboards and tables, your system is a navigable canvas — zoom into services, trace requests visually, diff environments in 3D, and act on infrastructure directly.

## Description

Orray is a spatial platform for understanding and operating distributed systems. It provides a navigable canvas where you can:

- **Visualize** your Kubernetes resources in a spatial layout.
- **Trace** requests and dependencies visually.
- **Diff** environments in a 3D space.
- **Act** on infrastructure directly from the canvas.

> **Note:** Orray is in early development.

## Getting Started

### Prerequisites

To contribute to or run Orray locally, you will need:

- **Go** (v1.24.6+)
- **Docker**
- **Tilt** (tilt.dev)
- **Kind** (Kubernetes in Docker)
- **Helm**
- **Kubectl**
- **Bun** (for UI and Docs development)

See [CONTRIBUTING.md](CONTRIBUTING.md) for a detailed guide on how to install these tools.

### Local Development

The easiest way to get started is using **Tilt** with **Kind**.

1. **Create a local cluster:**
   ```sh
   make dev-cluster-up
   ```

2. **Start the development environment:**
   ```sh
   tilt up
   ```

This will build the project, deploy it to your local Kind cluster, and start the UI with live-reload enabled.

## Project Structure

| Directory | Description | Tech Stack |
|-----------|-------------|------------|
| `api/` | CRD type definitions | Go |
| `cmd/` | Application entrypoints | Go |
| `pkg/` | Core logic and packages | Go |
| `ui/` | Frontend SPA | Vite + React |
| `docs/` | Documentation site | Next.js + Fumadocs |
| `charts/` | Helm charts | YAML |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed information on how to set up your environment and contribute to Orray.

## License

Copyright 2026. Licensed under the Apache License, Version 2.0.
