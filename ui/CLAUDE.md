# UI

Vite + React SPA. Uses `bun` as package manager.

## Lint & typecheck

```bash
make ui-lint    # biome check
make ui-types   # tsc --noEmit
```

Run both before considering any UI change done:

```bash
make ui-lint && make ui-types
```
