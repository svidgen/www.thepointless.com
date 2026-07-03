# AGENTS

## Start here

This file is the index card for agents. Keep detailed guidance in `docs/` to avoid drift.

Read these before making substantive changes:

1. `docs/wirejs-structure.md` — WireJS SSG/SSR routing, static assets, PWA/service-worker conventions, components, and tests.
2. `docs/content-migration.md` — migration standards, migrated page status, award certificate routing, accepted warnings, and tone guidance.
3. `src/ssg/about.ts` when doing content/copy work; it is important to know what allegations have been made about this site's content. 😉
4. `MIGRATION_SUMMARY.md` for recent decisions, observations, and current migration state.

## Critical repo rules

- This is a WireJS migration, not a plain static HTML site.
- Active code lives in `src/`, `api/`, and `static/`.
- Legacy reference content lives in `archive/` and older `src/routes/` files.
- New/migrated pages should generally go in `src/ssg/` or `src/ssr/`, not `archive/`.
- Reusable UI belongs in `src/components/`.
- Shared page shells belong in `src/layouts/`.
- Use WireJS `generate()` + `hydrate()` for interactive SSG pages; keep decomposed TypeScript modules in `src/components/`, `src/lib/`, or another source-adjacent module location instead of inventing static JS bundles.
- Static/CDN-style assets belong in `static/`; PWA runtime assets should generally use `static/apps/<app-name>/`. Do not put page behavior in `static/` just because it runs in the browser.
- Do not edit generated `dist/` or `pre-dist/` directly.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run start`
- Build: `npm run build`
- Tests: `npm test`

For background dev-server usage, record the PID and clean it up:

```sh
npm run start & echo $! > .devserver.pid
kill $(cat .devserver.pid) && rm .devserver.pid
```

## Documentation maintenance

Keep `docs/` accurate.

If your change would make `docs/wirejs-structure.md`, `docs/content-migration.md`, or another doc incorrect or meaningfully incomplete, update the relevant doc in the same change.

Examples that require doc updates:

- New routing pattern or SSR behavior.
- New PWA/static asset convention.
- New reusable component pattern agents should know about.
- New migrated content category/status.
- Changed build/test workflow.
- Changed guidance around tone, copy, or pointlessness.

## Migration summary maintenance

Keep `MIGRATION_SUMMARY.md` up to date.

When you discover a migration-relevant observation, append a concise note with:

1. What you observed.
2. Where you observed it.
3. Proposed next action.

When a decision is made or a fix is applied, append another concise note recording:

1. The decision/change.
2. Where it was made.
3. Build/test/check result, if applicable.

Do not remove prior migration notes unless explicitly instructed.
