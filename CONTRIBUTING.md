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

This site is built with WireJS. Keep the framework details in the WireJS docs rather than this file:

- Human/contributor reference: `node_modules/wirejs-scripts/README.md`
- Agent repo guidance: `AGENTS.md`, especially `docs/wirejs-structure.md` and `docs/content-guidance.md`

Short version:

- `src/ssg/` contains statically generated pages/artifacts.
- `src/ssr/` contains request-time routes.
- Shared components belong in `src/components/`.
- Page-specific generated artifacts (for example generated CSS) can live next to the route that emits them; reusable or decomposed behavior belongs in `src/components/` or `src/lib/`.
- `static/` is only for public assets intentionally served under `/static/*`.
- Do not edit generated `dist/` or `pre-dist/` directly.

For interactive SSG pages, prefer WireJS's `generate()` + `onload()` pattern, using `hydrate()` inside `onload()` when rendered components need browser rebinding. Keep browser behavior in decomposed TypeScript modules rather than inventing separate static asset bundles.

## Package structure

| Folder | Purpose |
|---|---|
| `api/` | API/resource workspace. |
| `archive/` | Legacy reference content. |
| `docs/` | Lightweight repo-specific notes. |
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
