# Contributing

Pull the package down. Forgive the cruft. Make awesome new things!

"New things" could be articles, poems, games, quizzes, clickbait, upgraded old content, or almost literally anything else.

## Basics

Fork the repo, install dependencies, and start the local dev server:

```sh
npm install
npm run start
```

Build and test before submitting substantial changes:

```sh
npm run build
npm test
```

## WireJS project shape

This site is a WireJS migration. Keep the details in the WireJS docs rather than this file:

- Human/contributor reference: `node_modules/wirejs-scripts/README.md`
- Agent repo guidance: `AGENTS.md`, especially `docs/wirejs-structure.md` and `docs/content-migration.md`

Short version:

- `src/ssg/` contains statically generated pages/artifacts.
- `src/ssr/` contains request-time routes.
- Shared components belong in `src/components/`.
- Page-specific decomposed code can live next to the page that uses it.
- `static/` is only for public assets intentionally served under `/static/*`.
- Do not edit generated `dist/` or `pre-dist/` directly.

For interactive SSG pages, prefer WireJS's `generate()` + `hydrate()` pattern so markup and browser behavior can share decomposed TypeScript modules without inventing separate static asset bundles.

## Package structure

| Folder | Purpose |
|---|---|
| `api/` | API/resource workspace. |
| `archive/` | Legacy pre-migration reference content. |
| `docs/` | Lightweight repo-specific migration notes. |
| `src/ssg/` | Static routes and generated artifacts. |
| `src/ssr/` | Server-rendered/request-time routes. |
| `src/components/` | Reusable WireJS components. |
| `src/layouts/` | Shared page shells. |
| `src/lib/` | Shared non-component code/data. |
| `static/` | Public static files served as `/static/*`. |
| `tests/` | Playwright regression/smoke tests. |

## A note on code quality

Try to follow nearby patterns. Keep pointlessness intact. Be receptive to PR feedback. We will try not to be terrible.

You can also contribute by submitting and commenting on issues: ideas, bugs, questions, or just saying “Hi.”
