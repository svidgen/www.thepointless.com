# AGENTS

## Purpose
This file describes the current repository layout and migration state for coding agents. It is intended to help AI agents quickly understand where active code lives, where the legacy archive lives, and how to make meaningful contributions during migration.

## High-level status
- The repository is in the middle of a migration from an older PHP-based archive site to a new JavaScript/WireJS architecture.
- The legacy content lives under `archive/`; the new architecture lives under `src/`.
- `api/` is a separate workspace package for backend API code.
- `dist/` and `pre-dist/` are generated outputs and should generally not be edited directly.

## Top-level layout
- `api/` - backend API package, built with WireJS tooling. Contains API entrypoints and generated dist files.
- `archive/` - legacy pre-migration PHP site copy, including pages, includes, and themes.
- `dist/` - build output for deployment.
- `node_modules/` - installed dependencies.
- `pre-dist/` - intermediate build output created by the WireJS build process.
- `scripts/` - utility scripts used during development and build workflows.
- `src/` - the new site source: layouts, components, library modules, route definitions, SSG pages, and app code.
- `static/` - static assets deployed as-is.

## Root package
- `package.json` defines the main workspace and scripts:
  - `npm run start` → `wirejs-scripts start`
  - `npm run build` → `wirejs-scripts build`
- Workspaces: `src` and `api`
- Dependencies include `wirejs-dom`, `wirejs-resources`, and `qrcode`. The repository uses a local `wirejs-scripts` package as a devDependency for start/build tooling.

## `src/` architecture
`src/` is the primary codebase for the new architecture.

### Key folders
- `src/components/` - reusable WireJS DOM components, UI widgets, styles, and helper modules.
- `src/layouts/` - top-level page layouts such as `main.ts`, which provides the shared page shell used by routes.
- `src/lib/` - shared JavaScript modules that are not WireJS components.
- `src/routes/` - route modules and page code. Most route files live directly here as `.html`, `.md`, `.js`, or `.rss` entries, with feature subfolders for:
  - `experimental/`
  - `hs/` (horoscopes / interactive features)
  - `words/` (writing and word-focused content)
- `src/ssg/` - static site generation entrypoints and generation utilities.

### Notable files
- `src/layouts/main.ts` - shared main page layout used by all SSG pages, including the home page.
- `src/ssg/index.ts` - SSG entry for the home page; uses `Main()` from `src/layouts/main.ts` like all other SSG pages.
- `src/ssg/*.ts` - other SSG page generators; each uses `Main()` from `src/layouts`.
- `src/package.json` - workspace package metadata for the source package.

## `api/` package
- `api/index.ts` - backend API entry file.
- `api/package.json` - package metadata and build hooks:
  - `prestart` / `prebuild` → `wirejs-scripts prebuild-api`
  - `wirejs:client` entrypoint for client bundle output
- `api/dist/` - generated API build output.

## Legacy content in `archive/`
- `archive/pages/` - legacy page templates and PHP includes.
- `archive/includes/` - legacy server-side includes and helper modules.
- `archive/themes/` - old theme templates.

> The legacy archive is preserved as reference and migration source. New features and pages should generally be built in `src/`, not added to `archive/`.

## Generated outputs
- `dist/` - production/build output. Do not edit directly.
- `pre-dist/` - build intermediate artifacts from `wirejs-scripts`.

## Static assets
- `static/` - static deployable assets such as `ads.txt`, `default.css`, and `images/`.

## Migration guidance
- When working on this repo, prefer `src/` for new code.
- Use `archive/` only to migrate existing PHP/legacy content into the new architecture.
- Keep changes isolated where possible: `src/components` for reusable widgets, `src/routes` for page-specific route logic, `src/layouts` for page shells.
- Avoid modifying `dist/`, `pre-dist/`, or `node_modules/` unless you are intentionally updating build outputs or dependencies.

## How to run
- Install dependencies: `npm install`
- Start dev server (background): run `npm run start` in a background job and record the node PID for later termination. Example: `npm run start & echo $! > .devserver.pid` or `nohup npm run start > logs/devserver.log 2>&1 & echo $! > .devserver.pid`. To stop the server: `kill $(cat .devserver.pid)` and then `rm .devserver.pid`.
- Build production code: `npm run build`

## Notes for agents
- This repo is not a plain static HTML site; it uses the WireJS frontend architecture.
- Treat `src/` and `api/` as active code, and `archive/` as legacy reference.
- Look for component definitions in `src/components/` and route/page definitions in `src/routes/`.
- If asked to migrate content, map legacy files from `archive/` into `src/` rather than editing the legacy site in place.
- If asked to improve build tooling, check `package.json`, `src/package.json`, and `api/package.json` for current workspace and script setup.

Important: keep the migration summary up to date
- When you (the agent) discover a new migration-relevant observation (build failure, dev-server behaviour, missing SSG output, etc.), append a concise note to MIGRATION_SUMMARY.md describing:
  1. What you observed (one line).
  2. Where you observed it (file, log, URL, or command output).
  3. Proposed next action (one line).
- If the user then instructs a decision (e.g. apply a fix), update MIGRATION_SUMMARY.md again to record the decision and the change made.

This simple loop (observe → document → act → document) keeps a single authoritative migration log other agents and humans can follow. Keep entries brief and factual; do not remove prior entries unless instructed.
## Quick structural map
- `api/`
  - `index.ts`
  - `package.json`
  - `dist/`
- `archive/`
  - `includes/`
  - `pages/`
  - `themes/`
- `src/`
  - `components/`
  - `layouts/`
  - `lib/`
  - `routes/`
  - `ssg/`
- `static/`
  - `images/`
- `scripts/`
- `dist/`
- `pre-dist/`
