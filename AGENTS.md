# Agent file

The purpose of this file is to describe common mistakes and confusion points that agents might encounter as they work in this project. If you ever encounter something in the project that surprises you, please alert the developer working with you and indicate that this is the case to write it in this file to help prevent future agents from having the same issue.

# Workflow

- **After every code change**: Run lint, tests, and CodeRabbit review (`/coderabbit:review`) before considering the task done.
- For `docs/`: Run `bunx ultracite check` to lint the docs.
- For `ui/`: Run `cd ui && bun run lint && bun run types:check` to lint and typecheck the UI.
