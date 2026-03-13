# UI

Vite + React SPA.

## Lint, typecheck & review

Run all three before considering any UI change done:

```bash
make ui-lint    # biome check
make ui-types   # tsc --noEmit
```

Then run `/coderabbit:review`.
