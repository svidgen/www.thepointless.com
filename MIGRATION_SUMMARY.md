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

## Observation — event helper warning impact (2026-07-02)
- Observed: Build warning comes from `src/lib/event.cjs` condition `!o[eventName] instanceof Event`; due to operator precedence it never tests the intended negated `instanceof`, and the same branch references undefined `TG.Event`.
- Where: `src/lib/event.cjs:77-78`; used by `src/lib/shooty-ship/game.cjs` and imported by `src/ssg/apps/shooty-ship/js/game.ts`; legacy variants also exist under archived/static Shooty Ship app bundles.
- Proposed next action: Fix the condition to `!(o[eventName] instanceof Event)` and replace `new TG.Event(...)` with `new Event(...)`, then smoke-test Shooty Ship initialization/readiness flows.

## Decision — leave legacy Shooty Ship event helper unchanged (2026-07-02)
- Decision/change: Do not modify `src/lib/event.cjs` for the current build warning because Shooty Ship is long-running legacy behavior and there is no confirmed observable bug.
- Where: `src/lib/event.cjs:77-78`; build warning from `npm run build`.
- Next action: Revisit only if Shooty Ship readiness/event behavior breaks in testing; otherwise treat as legacy-warning debt.

## Observation — live vs local content crawl (2026-07-02)
- Observed: Quick crawl compared `https://www.thepointless.com/` with `http://localhost:3000/`; local nav/footer pages mostly match core text, but `/reddot` is 404 locally, `/words/unclassified/index.html` and `/words/serious/index.html` are linked locally and 404, and `/apps/index.html` is a skeletal page with no app links/content.
- Where: curl/python crawl of live and localhost:3000; legacy sources under `src/routes/reddot.html`, `src/routes/words/*`, and app/game assets under `src/ssg/apps/*`.
- Proposed next action: Prioritize migrating linked missing pages and obvious skeletal pages before style polish: add Red Dot SSG route/assets, add Words subcategory SSG pages, flesh out Apps & Games index, then rerun link/image crawl.

## Decision — migrated first crawl content gaps (2026-07-02)
- Decision/change: Added SSG Red Dot page, added Words subcategory pages, replaced skeletal Apps & Games content with visible lists, changed homepage news links to local anchors, and avoided linking still-pending app/word pages that would 404.
- Where: `src/ssg/reddot.ts`, `src/ssg/words/index.ts`, `src/ssg/words/{unclassified,serious,silly}/index.ts`, `src/ssg/apps/index.ts`, `src/news.cjs`, `src/ssg/books.ts`.
- Build/check result: `npm run build` succeeds; local crawl from `/` through internal links/images found no 404s. Build still emits the accepted legacy Shooty Ship event warning.

## Decision — Red Dot result flow and Shooty Ship smoke tests (2026-07-02)
- Decision/change: Added `dotresults` SSG page, normalized Red Dot submit button styling, linked Shooty Ship generated CSS, copied Shooty Ship app assets into `dist/apps/shooty-ship`, and added Playwright smoke tests via `npm run test`.
- Where: `src/ssg/dotresults.ts`, `src/ssg/reddot.ts`, `static/default.css`, `src/ssg/apps/shooty-ship/index.ts`, `scripts/copy-ssg-static-assets.js`, `playwright.config.ts`, `tests/migration-smoke.spec.ts`, `package.json`.
- Build/check result: `npm run build` succeeds and copies Shooty Ship audio/css/img assets; `npm test` passes 3 Chromium smoke tests for Red Dot scoring/button styling and Shooty Ship asset/page initialization. Legacy Shooty Ship event warning remains accepted debt.

## Observation/decision — Shooty Ship static asset paths and service worker (2026-07-02)
- Observed: Shooty Ship initialized, but share icon requests went to `/images/...` and 404ed locally; the app service worker cached relative app assets but its fetch handler always returned network fetches, so it was not actually serving cached fallbacks.
- Decision/change: Changed shared share-component default assets to `/static/images`, set Shooty Ship share icons to app-relative `img`, added `qr-code.svg` to Shooty Ship img assets, expanded Shooty Ship SW cache list, and changed SW fetch to network-first/cache-fallback.
- Where: `src/components/share.cjs`, `src/lib/shooty-ship/game.cjs`, `src/ssg/apps/shooty-ship/sw.ts`, `src/ssg/apps/shooty-ship/img/qr-code.svg`.
- Build/check result: `npm run build` and `npm test` pass; Playwright network probe found no localhost 404s on `/apps/shooty-ship/index.html`. Legacy event warning remains accepted debt.

## Observation/decision — manual live/local Shooty Ship comparison (2026-07-02)
- Observed: Manual Playwright comparison showed live Shooty Ship had full-screen game CSS and working app assets, while local dev had app-relative 404s after dev-server startup and missing legacy game layout CSS; local game rendered as normal document flow instead of full-screen until fixed.
- Decision/change: Linked `css/sheet-old.css` from Shooty Ship HTML, added it to the SW cache list, and changed the dev `start` script to run an asset-copy watcher so `dist/apps/shooty-ship/{audio,css,img}` is restored after the dev server recreates `dist`.
- Where: `src/ssg/apps/shooty-ship/index.ts`, `src/ssg/apps/shooty-ship/sw.ts`, `scripts/copy-ssg-static-assets.js`, `package.json`.
- Build/check result: Restarted dev server; `/apps/shooty-ship/img/icon.png` and `/apps/shooty-ship/css/sheet-old.css` now return 200 locally; live/local layout bounding boxes now match the full-screen square game area; `npm test` passes.

## Decision — PWA assets belong under static CDN paths (2026-07-02)
- Decision/change: Moved Shooty Ship runtime assets into `static/apps/shooty-ship`, removed build/start dist-copy workaround, and changed Shooty Ship HTML/game code to load images/audio/CSS from `/static/apps/shooty-ship/...` on first load.
- Where: `static/apps/shooty-ship/**`, `src/ssg/apps/shooty-ship/index.ts`, `src/ssg/apps/shooty-ship/manifest.json.ts`, `src/lib/shooty-ship/game.cjs`, `package.json`.
- Service worker: `src/ssg/apps/shooty-ship/sw.ts` now caches static CDN URLs and proxies legacy app-relative `img/`, `audio/`, and `css/` requests to `/static/apps/shooty-ship/...` as a compatibility fallback.
- Build/check result: `npm run build` and `npm test` pass; manual local probe shows Shooty Ship first-load assets now use `/static/apps/shooty-ship/...` and no localhost app-asset 404s remain.

## Decision — Shooty Ship root-domain link (2026-07-02)
- Decision/change: Changed the Shooty Ship `thepointless.com` copyright/home link from hard-coded `https://www.thepointless.com` to `location.origin + '/'`, while keeping `/` as the static fallback href.
- Where: `src/lib/shooty-ship/game.cjs`.
- PWA note: For an installed same-origin PWA, `location.origin` should still be the installed app's served origin, so the link points back to that deployment's root domain; offline behavior still depends on whether the root page is cached/available.
- Build/check result: `npm run build` and `npm test` pass.

## Decision — remove duplicated Shooty Ship runtime assets from SSG tree (2026-07-02)
- Decision/change: Removed duplicated Shooty Ship `audio/`, `css/`, and `img/` runtime asset folders from `src/ssg/apps/shooty-ship`; canonical copies now live under `static/apps/shooty-ship` and are referenced/cached from there.
- Where: removed `src/ssg/apps/shooty-ship/{audio,css,img}`; retained app source/generators under `src/ssg/apps/shooty-ship`.
- Build/check result: Initial build failed with `ENOTEMPTY` while dev server held `pre-dist`; after stopping dev server and clearing `dist`/`pre-dist`, `npm run build` and `npm test` pass. Legacy event warning remains accepted debt.

## Decision — migrate Apps & Games clicky pages (2026-07-02)
- Decision/change: Migrated Green Dot, Pregnancy Test, Zebra Awareness/test/result, Clickometer/result into SSG and linked them from Apps & Games; Clickometer script is served as a static app asset.
- Where: `src/ssg/greendot.ts`, `src/ssg/preggertest.ts`, `src/ssg/zebra-awareness*.ts`, `src/ssg/clickometer*.ts`, `static/apps/clickometer/clickometer.js`, `src/ssg/apps/index.ts`, `src/ssg/dotresults.ts`.
- Build/check result: `npm run build` and `npm test` pass; crawl from `/apps/index.html` found no internal page/image/script 404s. Manual smoke caught and fixed legacy `global` usage in Clickometer script by switching to `globalThis`.

## Decision — normalize migrated button styling (2026-07-02)
- Decision/change: Added global default styling for `button`, submit/button inputs, and `.button` so migrated legacy forms do not render with browser-default ugly buttons.
- Where: `static/default.css`; affects Zebra Awareness test, Clickometer, dot forms, and future migrated legacy forms.
- Build/check result: `npm run build` passes; Playwright style probe confirms Zebra submit button now uses site font, border radius, padding, and pointer cursor.

## Decision — fix Clickometer migration regressions (2026-07-02)
- Decision/change: Restored Clickometer boom-stage behavior by guarding the removed legacy `#container` reference, centered the countdown inside the meter with flex positioning, and restored mouse icons on result pages including cracked mouse for broken scores.
- Where: `static/apps/clickometer/clickometer.js`, `src/ssg/clickometer.ts`, `src/ssg/clickometer-result.ts`, `static/default.css`.
- Build/check result: `npm run build` and `npm test` pass; manual probe confirms result page shows `/static/images/75px_cracked_mouse.png` for broken score.

## Observation — Clickometer sooper mode pending (2026-07-02)
- Observed: Boom effect works after migration, and broken result shows super-clickometer messaging, but the follow-up link does not yet launch an actual sooper Clickometer mode.
- Where: Manual browser/console test on `/clickometer.html` and `/clickometer-result.html`; migrated sources `src/ssg/clickometer.ts`, `src/ssg/clickometer-result.ts`, `static/apps/clickometer/clickometer.js`.
- Proposed next action: Add `level=2`/sooper mode support to migrated Clickometer page and result flow.
