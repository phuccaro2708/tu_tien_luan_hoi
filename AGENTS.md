# Project rules

- Claude Code owns GDD design and gameplay implementation. Codex performs independent review, testing, and requested technical support.
- Do not invent lore, formulas, or gameplay systems before the GDD is designed and approved. After approval, do not expand beyond its scope without authorization.
- Keep game logic independent from React UI. Write the core engine in TypeScript; gameplay systems must be easy to unit test.
- Keep game state centralized and avoid divergent sources of truth. Store game content as data where practical.
- Prefer deterministic simulation for reproducible tests.
- Use no paid services. The MVP needs no backend and must support static deployment to Cloudflare Pages.
