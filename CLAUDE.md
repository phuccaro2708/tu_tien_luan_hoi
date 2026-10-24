# Claude Code handoff

Follow [AGENTS.md](AGENTS.md). Claude Code owns GDD design and gameplay implementation; Codex performs independent review, testing, and requested technical support.

- Design the GDD before implementing gameplay. Leave lore, formulas, and gameplay systems undecided until that design is approved. Do not expand beyond the approved GDD without authorization.
- Keep the TypeScript core engine and gameplay logic independent of React UI. Make gameplay systems easy to unit test.
- Centralize game state, avoid divergent sources of truth, and make game content data driven.
- Prefer deterministic simulation for reproducible tests.
- Use no paid services or backend for the MVP. Keep the static build deployable to Cloudflare Pages.

The project uses Vite, React, strict TypeScript, Zustand, Vitest, ESLint, Prettier, and plain CSS.
