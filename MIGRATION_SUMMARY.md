# Migration summary — cdk-migration vs main

This file captures what has been changed in the cdk-migration branch relative to main and gives a short plan for follow-up work.

## High-level diff
- Branch compared: cdk-migration
- Summary counts from git diff: 13 added, 17 deleted, 9 modified, ~106 pure renames/moves (R100) and a few partial renames.

## Major changes made so far
- Workspaces and packaging
  - Root package.json updated to introduce workspaces: `src` and `api`.
  - New `src/package.json` and `api/package.json` added.
  - Root dependencies adjusted: added `qrcode`, `wirejs-resources` and bumped/standardized `wirejs-dom` (^1.0.44). `wirejs-scripts` is referenced as a local devDependency (file: path).

- SSG / layout reorganization
  - Many files and app artifacts previously under `src/routes/...` were moved into `src/ssg/...` (large renames/moves). This consolidates static app assets and site-generation code into an `ssg` area.
  - Legacy layout files under `src/layouts/` (bare.html, default.*) were removed and replaced with a TypeScript-based layout: `src/layouts/main.ts` and `src/layouts/index.ts`.
  - `static/default.css` was added.

- TypeScript adoption
  - `tsconfig.json` added; `allowJs: true` to permit a staged migration (JS + TS coexist).
  - Several files converted to `.ts` under `src/ssg` and `src/layouts`.

- Module and extension changes
  - Many `.js` files were renamed to `.cjs` (lib and components) to preserve CommonJS semantics where required.
  - Some client scripts were converted/renamed to TS (e.g., `src/ssg/apps/shooty-ship/game.ts`).

- New API workspace
  - `api/index.ts` and `api/package.json` added. `api` is now a workspace package with prebuild/prestart hooks in its package.json (uses `wirejs-scripts prebuild-api`).

- Removed/cleaned deployment config
  - AWS Amplify configuration and related files (`amplify/` and amplify.yml) were removed.
  - `yarn.lock` removed; `package-lock.json` added.

## Codebase state relevant to WireJS migration
- Mixed API usage:
  - ~32 files still use CommonJS: `const { DomClass } = require('wirejs-dom')`.
  - 3 files import the v2 ESM API: `import { html } from 'wirejs-dom/v2'`.
  - `wirejs-resources` is present and used by layout/SSG code (Context / Authentication types).
- This indicates a staged migration: some code has been updated to v2/ESM patterns, while a substantial portion remains legacy CJS.
- The local `wirejs-scripts` reference means builds depend on a developer-local copy of the scripts unless CI is adjusted.

## Implications / risks
- Dev-server directory handling: during a dev run we observed the hosting layer does not automatically resolve directory requests (e.g. GET /apps/shooty-ship/) to an index.html — requesting the explicit index.html works. This appears to be a hosting/dev-server behaviour in WireJS and should be tracked as a runtime issue to fix in the dev server or hosting config.
- SSG output gaps: feed.rss was not emitted during the observed SSG run; SSG generation currently produced index and apps/shooty-ship artifacts only. This suggests SSG mapping or routing for certain pages (RSS, some routes) needs to be enabled/confirmed.

## Concrete next steps (recommended priority)
- Module mismatch risk: mixed CJS and ESM imports for `wirejs-dom` may cause build/runtime errors if the package version or module resolution is not compatible. The .cjs renames mitigate this in part but a consistent long-term strategy is needed.
- Build reproducibility: `wirejs-scripts` is referenced by a local file path. CI/dev machines need access to that path or the package must be published/updated to a non-local reference.
- Type/exports breakage: updating to newer wirejs-resources/wirejs-dom versions may change APIs (Context, DOM helpers), requiring code changes.

## Concrete next steps (recommended priority)
1. Audit (immediate)
   - Produce a file-level list of:
     - All files using `require('wirejs-dom')` (CJS)
     - All files importing `wirejs-dom/v2` (ESM)
     - Files moved from `src/routes` -> `src/ssg`
     - Files renamed from `.js` -> `.cjs` and `.js` -> `.ts`
   - This will create a clear migration surface.

2. Try a build (gather failures)
   - Run `npm ci` and `npm run build` with the local environment set up for `wirejs-scripts`. Capture errors and prioritize fixes.

3. Small, targeted codemods
   - Convert small, self-contained components from CJS -> ESM/v2 and update their tests/builds.

4. CI and tooling
   - Decide on a strategy for `wirejs-scripts` (publish or vendor into repo/CI). Ensure lockfile strategy is stable (npm vs yarn).

5. Document migration decisions in a migration plan document and assign owners for larger changes (API rewrites, package publishing).

## Useful commands (to reproduce lists)
- List CJS `wirejs-dom` usages:
  - rg "require\(['\"]wirejs-dom['\"]\)" -n
- List v2 ESM usages:
  - rg "wirejs-dom/v2" -n
- Show the git diff summary we used:
  - git --no-pager diff --name-status main...cdk-migration

---

## Recent updates
- 2026-06-29: Implemented SSG RSS generation: added `src/ssg/feed.rss.ts` which produces `/dist/feed.rss` from `src/news.cjs`. The new generator includes XML escaping and a description fallback. The dev server now emits `dist/feed.rss` and serves it with content-type `application/rss+xml`.
- 2026-06-29: Marked the legacy template `src/routes/feed.rss` as DEPRECATED and replaced its contents with a deprecation note. It can be removed from the repo (delete when ready).
- 2026-06-29: Dev-server directory handling remains: directory requests like `/apps/shooty-ship/` do not automatically resolve to `index.html` (explicit `/index.html` works). This still needs addressing in the dev-hosting layer.

If you want, I'll generate the file-level audit lists now and append them under this file (or create separate CSV/TSV outputs). Which do you want me to run next?
## Observation — landing page content truncation (2026-07-02)
- Observed: Built `dist/index.html` contains only the first paragraph from `src/ssg/index.ts` main content, despite `pre-dist/ssg/index.js` containing the full template.
- Where: `dist/index.html`; source `src/ssg/index.ts`; compiled intermediate `pre-dist/ssg/index.js`.
- Proposed next action: Wrap home page content in a single container element or adjust WireJS `html`/SSG handling of multi-root fragments, then rebuild.

## Observation — nav-linked SSG pages need legacy route content (2026-07-02)
- Observed: Several SSG pages linked from top/footer nav are abbreviated versus legacy `src/routes` content; `contribute.html` is linked but not emitted in `dist`.
- Where: `src/ssg/books.ts`, `src/ssg/careers.ts`, `src/ssg/terms.ts`, `src/routes/*.md|html`, `dist/`.
- Proposed next action: Port full route content into `src/ssg`, add `src/ssg/contribute.ts`, remove About from top nav only, and wrap multi-root SSG content in one container.

## Decision — nav page content port (2026-07-02)
- Decision/change: Removed About from the top nav, kept it in footer nav, ported fuller legacy route content into SSG nav pages, added `src/ssg/contribute.ts`, and wrapped multi-root content to avoid truncation.
- Where: `src/layouts/main.ts`, `src/ssg/index.ts`, `src/ssg/books.ts`, `src/ssg/careers.ts`, `src/ssg/terms.ts`, `src/ssg/contribute.ts`, related SSG pages.
- Build result: `npm run build` succeeds and now emits `dist/contribute.html`; build still warns about suspicious `!o[eventName] instanceof Event` in `src/lib/event.cjs:76`.
