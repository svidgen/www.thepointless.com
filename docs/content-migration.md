# Content migration notes

## Source of truth during migration

Legacy content is preserved under:

```txt
archive/
src/routes/
```

New migrated pages should generally be implemented under:

```txt
src/ssg/
```

or, when runtime rendering/dynamic lookup is useful:

```txt
src/ssr/
```

Do not add new features to `archive/`.

## Style/tone note

The public About page intentionally denies the allegations that reveal the site's actual creative direction. 😉

Before making substantive copy changes, read:

```txt
src/ssg/about.ts
```

The site should remain pointless on purpose: silly, fake-serious, low-stakes, personal, and intentionally unnecessary without becoming careless or broken.

## Migration standards

When migrating a page:

1. Compare live production (`https://www.thepointless.com/...`) against local (`http://localhost:3000/...`) when possible.
2. Preserve the actual content and interaction behavior, but do not attempt pixel-perfect legacy styling.
3. Avoid browser-default ugly form controls; use shared styling in `static/default.css`.
4. Use `/static/...` paths for static images/assets.
5. Avoid linking to pages that have not been migrated unless clearly marked as pending.
6. Run `npm run build` and, where applicable, `npm test`.
7. Update `MIGRATION_SUMMARY.md` with observations and decisions.

## Current migrated app/clicky pages

The following legacy Apps & Games pages have SSG migrations:

- `src/ssg/reddot.ts`
- `src/ssg/greendot.ts`
- `src/ssg/dotresults.ts`
- `src/ssg/preggertest.ts`
- `src/ssg/zebra-awareness.ts`
- `src/ssg/zebra-awareness-test.ts`
- `src/ssg/zebra-awareness-result.ts`
- `src/ssg/clickometer.ts`
- `src/ssg/clickometer-result.ts`
- `src/ssg/apps/shooty-ship/*`

Runtime assets for app-like pages should live under `static/apps/<app-name>/` where practical.

## Award certificates

The Pointless Award badge is implemented as:

```txt
src/components/pointless-award.ts
```

Award data is currently hard-coded JSON, with shared award naming constants in the adjacent TypeScript module:

```txt
src/lib/pointless-awards.json
src/lib/pointless-awards.ts
```

Certificate rendering is SSR and wildcard-routed:

```txt
src/ssr/awards/certificates/%.ts
```

Canonical certificate URLs are extensionless and include the certificate number:

```txt
/awards/certificates/TPDC-PMWOT-0000000001
```

The older descriptive URL remains an SSG compatibility/canonical page:

```txt
/awards/professionally-maintained-waste-of-time.html
```

## Known accepted warning

Build currently emits a legacy warning in:

```txt
src/lib/event.cjs
```

Specifically around `!o[eventName] instanceof Event`. This is Shooty Ship legacy event helper debt. It has been intentionally left unchanged because the game is long-running legacy behavior and no current observable bug has been confirmed.
