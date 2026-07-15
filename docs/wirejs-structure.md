# WireJS structure notes

This repository is a WireJS site. It is not a plain static HTML site.

## Generated output

Do not edit these directly:

- `dist/` — deploy/build output.
- `pre-dist/` — intermediate compiled output.

Change source files under `src/`, `api/`, or `static/`, then run:

```sh
npm run build
```

## SSG pages

Static pages live under:

```txt
src/ssg/
```

A file like:

```txt
src/ssg/about.ts
```

emits:

```txt
dist/about.html
```

Nested SSG files emit nested routes. For example:

```txt
src/ssg/apps/index.ts -> /apps/index.html
```

Most SSG pages use the shared page shell:

```ts
import { Main } from '../layouts';
```

or, from nested directories, the appropriate relative path to `src/layouts`.

Use `wirejs-dom/v2` for new SSG markup:

```ts
import { html } from 'wirejs-dom/v2';
```

When returning multi-element content from SSG pages, wrap content in a single root container such as `<div>...</div>`. Multi-root fragments have previously caused truncation in generated output.

For interactive SSG pages, follow the WireJS `generate()` + `onload()` pattern: export `generate()` for server/build rendering and export `onload()` as the browser entrypoint. Use `wirejs-dom/v2`'s `hydrate()` inside `onload()` when a rendered component needs to be rebound. Keep reusable/decomposed TypeScript outside `src/ssg/` unless it is itself a generated route/artifact; page-specific generated non-HTML files can use pre-extension SSG filenames such as `index.css.ts -> index.css`.

## SSR pages

Server-rendered pages live under:

```txt
src/ssr/
```

Wildcard SSR routes use `%` in filenames. For example:

```txt
src/ssr/awards/certificates/%.ts
```

handles certificate paths such as:

```txt
/awards/certificates/TPDC-PMWOT-0000000001
```

SSR `generate()` receives a WireJS `Context`:

```ts
import type { Context } from 'wirejs-resources';

export async function generate(context: Context) {
  // context.location, context.responseCode, context.responseHeaders, etc.
}
```

### SSR redirects

To redirect from SSR, set `context.location` and return early. With current WireJS hosting, setting `context.location` is intended to drive redirects; if behavior is uncertain, verify with `curl -I`.

Example canonicalization pattern:

```ts
if (context.location.pathname.endsWith('.html')) {
  context.location = new URL(
    context.location.pathname.replace(/\.html$/, '') + context.location.search,
    context.location.origin,
  );
  return html`<html><body>Redirecting ...</body></html>`;
}
```

## API workspace

Backend API code lives under:

```txt
api/
```

The API package has its own `package.json` and prebuild hooks. Client-accessible API modules are generated through WireJS tooling.

## Components

Reusable components live under:

```txt
src/components/
```

Prefer new TypeScript / `wirejs-dom/v2` components for SSG-friendly reusable markup. Some legacy CommonJS components still exist and are used by older app/game code.

Current examples:

- `src/components/pointless-award.ts`
- `src/components/pointless-certificate.ts`
- `src/components/social-share.ts`
- `src/components/mailing-list-signup.ts`

## Static assets

Deployable static assets live under:

```txt
static/
```

Use `static/` for images, audio, CSS, and app runtime assets that should be served by the static/CDN layer rather than packed into SSR/SSG Lambda bundles.

For PWAs/apps, prefer:

```txt
static/apps/<app-name>/...
```

Example:

```txt
static/apps/shooty-ship/img/shiny.jpg
static/apps/shooty-ship/audio/pew-128.mp3
```

and reference them as:

```txt
/static/apps/shooty-ship/img/shiny.jpg
```

## PWAs and service workers

PWA shells may live under `src/ssg/apps/<app-name>/`, but runtime assets should generally live under `static/apps/<app-name>/`.

A service worker under `/apps/<app-name>/` controls app pages under that scope. It may fetch and cache static assets from `/static/apps/<app-name>/...` for offline use.

For each app, keep cache names and static bases app-specific:

```ts
const CACHE_NAME = `<app-name>-cache-${BUILD_ID}`;
const STATIC_BASE = '/static/apps/<app-name>/';
```

## Testing

Playwright smoke tests live under:

```txt
tests/
```

Run:

```sh
npm test
```

Current tests cover Red Dot flow/button styling and Shooty Ship asset/page initialization.
