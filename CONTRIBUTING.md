# Contributing

Thanks for helping improve `cdc-growth-charts`. This is healthcare-adjacent software, so small, verifiable changes are preferred over broad rewrites.

## Local Setup

Use Node 20. The repo includes `.nvmrc` and `.node-version`.

```bash
npm ci
npm run dev
```

## Required Checks

Run these before opening a PR:

```bash
npm run lint
npx tsc --noEmit
npm run validate:data
npm run build
npm audit --omit=dev
```

## CDC Data Changes

Raw CDC files live in `data/raw/`. If any source CSV changes:

1. Update `data/raw/README.md` with source date and SHA256.
2. Run `node data/build_lms.mjs`.
3. Run `npm run validate:data`.
4. Explain the source and validation result in the PR.

Do not hand-edit `lib/growthData.ts`.

## Pull Request Checklist

- Keep behavior changes scoped and described clearly.
- Include validation output in the PR body.
- Preserve the educational-use disclaimer and avoid diagnostic claims.
- For deployment changes, test root-path Docker behavior and document any `BASE_PATH` implications.
- For UI changes, check mobile and desktop widths and keep text from overflowing controls.
