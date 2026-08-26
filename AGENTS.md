# AGENTS

## Start here

This file is the index card for agents. Keep detailed guidance in `docs/` to avoid drift.

# General Guide

Do not rely on WireJS knowledge from another project, branch, npm version, or web search unless the user asks. Prefer the installed package READMEs under `node_modules`, especially:

- `node_modules/wirejs-resources/README.md`
- `node_modules/wirejs-dom/README.md`
- `node_modules/wirejs-scripts/README.md`

If a README is not at the expected path, locate it with `require.resolve`, for example:

```sh
node -e "console.log(require.resolve('wirejs-resources/package.json').replace(/package\.json$/, 'README.md'))"
node -e "console.log(require.resolve('wirejs-dom/package.json').replace(/package\.json$/, 'README.md'))"
node -e "console.log(require.resolve('wirejs-scripts/package.json').replace(/package\.json$/, 'README.md'))"
```

When testing with `npm run start` or `npm run start:public`, run the process in the background and explicitly stop it afterwards.

For normal app changes, start in:

- `src/ssg/` for static routes
- `src/ssr/` for server-rendered routes
- `src/components/` and `src/layouts/` for shared DOM/layout code
- `api/` for API/resources code
- `static/` for public static assets

## Details

Read these before making substantive changes:

1. `docs/wirejs-structure.md` — WireJS SSG/SSR routing, static assets, PWA/service-worker conventions, components, and tests.
2. `docs/content-guidance.md` — legacy-content guidance, active restored page status, award certificate routing, accepted warnings, and tone guidance.
3. `src/ssg/about.ts` when doing content/copy work; it is important to know what allegations have been made about this site's content. 😉

## Critical repo rules

- This is a WireJS site, not a plain static HTML site.
- Active code lives in `src/`, `api/`, and `static/`.
- Legacy reference content lives in `archive/` and older `src/routes/` files.
- New/restored pages should generally go in `src/ssg/` or `src/ssr/`, not `archive/`.
- Reusable UI belongs in `src/components/`.
- Shared page shells belong in `src/layouts/`.
- Use WireJS `generate()` + `onload()` for interactive SSG pages, with `hydrate()` inside `onload()` when components need browser rebinding; keep decomposed TypeScript modules in `src/components/`, `src/lib/`, or another source-adjacent module location instead of inventing static JS bundles.
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

If your change would make `docs/wirejs-structure.md`, `docs/content-guidance.md`, or another doc incorrect or meaningfully incomplete, update the relevant doc in the same change.

Examples that require doc updates:

- New routing pattern or SSR behavior.
- New PWA/static asset convention.
- New reusable component pattern agents should know about.
- New restored legacy content category/status.
- Changed build/test workflow.
- Changed guidance around tone, copy, or pointlessness.

## Historical notes

If you uncover a decision that should be preserved for posterity, move the useful fact into the relevant `docs/` file.
