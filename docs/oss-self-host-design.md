# Growth Charts — Self-Host Design Doc

**Status:** Draft for pre-OSS launch
**Owner:** @manan
**Target:** Open-source self-hostable pediatric growth chart viewer

---

## 1. What this is

A single-page, client-only web app that lets parents (and clinicians, informally) plot a child's weight, length/height, head circumference, and BMI against the standard pediatric growth reference curves, with percentile readouts.

**Self-host primitives:** ships as a Next.js app you can run via `docker run`, `npm start`, or static-export to any object store / CDN. No database, no backend service, no user accounts, no telemetry.

## 2. Goals

- **Trustworthy reference plotting.** Numbers and curves match what a US pediatric EMR would show, traceable to the source dataset.
- **Zero-effort self-host.** `docker compose up` is the full quickstart.
- **Two clearly separated modes.** Hosted (the author's krytonlabs.com deploy): ephemeral, no persistence, "quick check and leave." Self-host: same code, but `NEXT_PUBLIC_ENABLE_TRACKING=true` flips on localStorage tracking + Baby Buddy CSV export.
- **Local-only by default.** Measurements never leave the user's browser. Self-host's localStorage stays on-device; the Baby Buddy CSV export is a user-initiated download.
- **Graceful exit to Baby Buddy.** Self-host users who outgrow this tool can export their measurements as [Baby Buddy](https://github.com/babybuddy/babybuddy)-format CSVs and import them into a full Baby Buddy instance.
- **Honest scope.** This is a *viewer/calculator*, not a medical device, not a longitudinal EHR.

## 3. Non-goals

- Not a medical device. No diagnostic claims, no clinical decision support.
- Not HIPAA-compliant out of the box. Operators who want to deploy in a clinical context are responsible for their own compliance posture.
- No multi-user accounts, no cloud sync, no sharing links in v1.
- No printable PDF growth charts in v1 (deferred).
- Not a replacement for the CDC/WHO official tools — it's a more usable parent-facing front-end to the same data.

## 4. Users

| User | Need | How we serve |
|---|---|---|
| Parent (primary) | "Is my baby's weight normal?" — quick percentile lookup between pediatrician visits | Mobile-friendly form, immediate plot, plain-language percentile explanation |
| Self-hoster (operator) | Run it on a Pi, on a homelab, on a clinic intranet | Docker image, single env var for basePath, no external deps |
| Clinic/NGO | Offline-capable growth assessment in low-connectivity settings | Static export to USB / kiosk |
| Developer | Embed the calculation library in another tool | `lib/growthCalculations.ts` is self-contained and free of UI deps |

## 5. Architecture

```
┌────────────────────────────────────────────┐
│  Browser                                   │
│  ┌──────────────────────────────────────┐  │
│  │  React 19 / Next 16 (client-only)    │  │
│  │  ┌────────┐  ┌─────────┐  ┌────────┐ │  │
│  │  │  Form  │─▶│  State  │─▶│ Charts │ │  │
│  │  └────────┘  └─────────┘  └────────┘ │  │
│  │                  │                    │  │
│  │                  ▼                    │  │
│  │  ┌─────────────────────────────────┐ │  │
│  │  │  LMS reference tables (bundled) │ │  │
│  │  │  lib/growthData.ts (~29 KB gz,  │ │  │
│  │  │                     ~98 KB raw) │ │  │
│  │  └─────────────────────────────────┘ │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
                    ▲
                    │ static assets only
                    │
┌────────────────────────────────────────────┐
│  Origin (Next server / static host / CDN)  │
│  - serves HTML + JS + CSS                  │
│  - no API routes, no DB, no auth           │
└────────────────────────────────────────────┘
```

**Layers:**

- `app/` — Next.js App Router, one page, all client components.
- `components/` — `MeasurementForm`, `GrowthChart`, `DatePicker`, `ThemeToggle`.
- `lib/growthCalculations.ts` — age/percentile math, unit conversions. **UI-free.**
- `lib/growthData.ts` — auto-generated LMS tables. Do not edit by hand.
- `data/raw/*.csv` — vendored source CSVs.
- `data/build_lms.mjs` — regenerates `lib/growthData.ts` from `data/raw/`.

**Why client-only:** every operation is a pure function of (birth date, sex, measurement, unit) and a static lookup table. No server-side compute justifies the deployment complexity of a backend.

## 6. Data model

A measurement is plain JSON, held in React state (`app/page.tsx`):

```ts
type MeasurementData = {
  date: Date;
  ageMonths: number;
  weight?: number;            // kg, canonical
  length?: number;            // cm, canonical
  headCircumference?: number; // cm, canonical
};
```

US inputs (lb/oz, inches) are converted to metric at form-submit time. Display formatting respects the user's chosen unit system.

Age is computed in fractional months using a 30.4375-day month (`lib/growthCalculations.ts:97`), matching the CDC reference's convention for age-based LMS lookups.

**Persistence is mode-dependent:**

- **Hosted mode** (`NEXT_PUBLIC_ENABLE_TRACKING` unset/`false`): pure `useState`. Refresh = data lost. This is the "quick check and leave" experience.
- **Self-host mode** (`NEXT_PUBLIC_ENABLE_TRACKING=true`): on mount, hydrate from `localStorage["growth-charts.measurements"]`; on every change, debounce-save back. Versioned schema (`{ version: 1, ... }`) with `JSON.parse` wrapped in try/catch so corrupt entries silently fall back to empty rather than crashing.

**Baby Buddy CSV export** (self-host mode only): a single button produces four downloads matching [Baby Buddy's import fixtures](https://github.com/babybuddy/babybuddy/tree/master/core/tests/import) exactly:

```
weight.csv:            child_id,weight,date,notes
height.csv:            child_id,height,date,notes
headcircumference.csv: child_id,head_circumference,date,notes
bmi.csv:               child_id,bmi,date,notes
```

`child_id` defaults to `1` (Baby Buddy's first-child default); users with multiple Baby Buddy children can edit the CSV before importing. Values are written in whatever unit system the UI is currently displaying — UI labels the download with the unit explicitly ("Exporting weight in kg").

## 7. Reference data

Source: CDC growth charts (LMS parameters) at `https://www.cdc.gov/growthcharts/`.

Files under `data/raw/`:

| File | Coverage | Sex | Metric |
|---|---|---|---|
| `wtageinf.csv` | 0–36mo | both | Weight-for-age |
| `wtage.csv` | 24–240mo | both | Weight-for-age |
| `lenageinf.csv` | 0–36mo | both | Length-for-age (recumbent) |
| `statage.csv` | 24–240mo | both | Stature-for-age (standing) |
| `hcageinf.csv` | 0–36mo | both | Head-circumference-for-age |
| `bmiagerev.csv` | 24–240mo | both | BMI-for-age |
| `wtleninf.csv` | infant | both | Weight-for-length (currently unused in UI) |

**Out-of-range handling:** `getLMSForAge` clamps to the table's first/last row rather than extrapolating (extrapolating LMS curves is dangerous and produces nonsense values). The UI surfaces this explicitly with an amber "outside chart range" banner (`components/GrowthChart.tsx:179-186`) and labels the per-point percentile as "Outside chart range" instead of returning a misleading number. **Do not "fix" this into extrapolation.**

**Open issue (P0 before launch):** The app copy in `app/layout.tsx:7` and `app/page.tsx:61` claims "WHO and CDC standards", but the bundled data is purely CDC (verified: all six imports in `data/build_lms.mjs:11-19` are CDC LMS files; no WHO data is referenced anywhere in `lib/` or `data/`). Options:

- **(A) Fix the copy.** Say "CDC growth reference" everywhere. Simplest, ships today.
- **(B) Add WHO 0–24mo tables** and switch over for the infant range (current US clinical practice since 2010). Higher work, more correct.

Recommend (A) for v1 and (B) for v1.1.

`data/raw/README.md` (to be added) will record source URL, retrieval date, and SHA256 of each CSV so downstream auditors can verify provenance.

## 8. Deployment

### 8.1 Docker (recommended)

The published image is built with `BASE_PATH=""` so it Just Works at the root path:

```bash
docker run -d --name growth-charts -p 3000:3000 \
  ghcr.io/<org>/growth-charts:latest
```

The runtime image uses Next.js's [`output: 'standalone'`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) mode — a three-stage multi-stage build (`deps`, `builder`, `runner`), final image ~150 MB, runs as non-root `nextjs:nodejs`, includes a `HEALTHCHECK`. This matches the [official Next.js with-docker example](https://github.com/vercel/next.js/blob/canary/examples/with-docker/README.md) and the pattern used by Cal.com, Documenso, etc.

### 8.2 Bare Node

```bash
npm install
npm run build
npm start          # listens on :3000
```

Node ≥ 20.9 required (declared in `package.json:engines`).

### 8.3 Static export

The build output confirms every page already prerenders as `○ (Static)` — no SSR data fetching, no API routes, no middleware. Flipping `output: 'export'` in `next.config.mjs` produces a fully static `out/` directory deployable to S3, Cloudflare Pages, GitHub Pages, a USB drive, etc.

**One known gotcha** ([vercel/next.js#73427](https://github.com/vercel/next.js/issues/73427)): `output: 'export'` combined with a non-empty `basePath` and default `trailingSlash: false` causes the RSC payload to 404 at the root. Workaround: set `trailingSlash: true` when using both. For now the simplest recommendation is "static export is supported at root path only" until that bug clears.

### 8.4 Reverse proxy / sub-path

`next.config.mjs` currently hard-codes `basePath: '/childgrowth'`. Before OSS launch this becomes a **build-time argument**, defaulting to root.

> **Why build-time, not runtime?** `basePath` is inlined into the client JS bundle at `next build` — this is a Next.js limitation, not a project choice (see [the official basePath reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) and the long-standing [discussion #16059](https://github.com/vercel/next.js/discussions/16059)). Setting `BASE_PATH` at `docker run` time has no effect on the served bundle. This matches what [Umami](https://docs.umami.is/docs/environment-variables) and every other self-hostable Next app does.

```js
// next.config.mjs
const basePath = process.env.BASE_PATH || '';
export default {
  reactStrictMode: true,
  output: 'standalone',
  basePath,
  assetPrefix: basePath || undefined,
};
```

```dockerfile
# Dockerfile (runner stage omitted for brevity)
ARG BASE_PATH=""
ENV BASE_PATH=$BASE_PATH
RUN npm run build
```

**For operators:**

- Most users: pull the published image, run it, done.
- Sub-path mount: `docker build --build-arg BASE_PATH=/childgrowth -t growth-charts .` and run that image. Reverse-proxy `proxy_pass http://127.0.0.1:3000/childgrowth;` — do **not** strip the prefix, Next expects it intact.

## 9. Configuration

| Variable | Default | Scope | Purpose |
|---|---|---|---|
| `BASE_PATH` | `''` | **Build-time** (Docker `ARG`) | URL prefix when hosted on a sub-path. Requires image rebuild. |
| `NEXT_PUBLIC_ENABLE_TRACKING` | `false` (hosted), `true` (self-host Docker default) | **Build-time** (inlined into client bundle) | Turns on localStorage persistence and Baby Buddy CSV export button. |
| `PORT` | `3000` | Runtime | Next.js listen port (standard Next behavior). |
| `HOSTNAME` | `0.0.0.0` | Runtime | Standalone server bind address. |

No secrets. No external API keys. `.env.example` documents the above and nothing else.

## 10. Pre-launch punch list

Ordered by what blocks open-sourcing. Items marked **[V]** are direct outputs of the validation pass; their fixes are grounded in [external best-practice research](#13-versioning--releases) (see footnote citations in this section).

### P0 — blocks the public push to main

1. **LICENSE — Apache 2.0** (revised from MIT). Apache 2.0 includes an explicit patent grant, which is the cautious choice for healthcare-adjacent code even when the underlying data is public-domain. Permissions are otherwise identical to MIT for end users; cost is one extra file (`NOTICE`). AGPL was considered and rejected — enterprise self-hosters (clinics, NGOs) commonly blacklist it.
2. **WHO/CDC copy fix** — pick option (A) or (B) from §7 and align `app/layout.tsx`, `app/page.tsx`, and the footer.
3. **Medical disclaimer — banner + page** (revised from "just a banner"). Match the MDCalc pattern: (a) persistent, non-dismissible above-the-fold sentence ("Educational use only. Not medical advice. Consult your pediatrician. In an emergency, call local emergency services."), and (b) a footer link to a dedicated `/disclaimer` page with the full four-clause legal text (educational purposes, not professional advice, consult provider, emergency contact). Do not gate use behind a dismissible modal — friction without safety benefit.
4. **Birth-date year range** — `components/DatePicker.tsx:63` currently allows 100 years back. Cap at `today` and floor at ~20 years.
5. **`BASE_PATH` as build-time `ARG`, defaulting to root** [V] — see §8.4. `basePath` is a build-time inlined value in Next.js; this is the universal self-host pattern (Umami, etc.). The published image must build with `BASE_PATH=""` so the unconfigured `docker run` works at `/`.
6. **`output: 'standalone'` in `next.config.mjs`** [V] — required for the multi-stage Dockerfile to produce a ~150 MB image instead of ~1 GB. Matches the official Next.js with-docker example. Without this, "Dockerfile hardening" (P1) doesn't deliver its size benefit.
7. **Strip `/home/manan/...` from `ecosystem.config.js:7`** [V] — narrowed from "strip personal IDs from 5 files". Validation confirmed the other deploy configs (`railway.json`, `nixpacks.toml`, `DEPLOY_NOW.md`, `push-to-github.ps1`) contain no secrets and no personal identifiers; only the hardcoded absolute interpreter path leaks. Either remove the `interpreter:` line (let PM2 use `$PATH`) or document that this file is a personal example and users should write their own.
8. **Fix mangled UTF-8 in `DEPLOY_NOW.md`** [V] — characters render as `âœ…` instead of ✅. Cosmetic but glaring in GitHub web view. Re-save as UTF-8 without BOM.
9. **Fix `npm run lint` (broken under Next 16)** [V] — `next lint` was removed in Next 16. Run the official codemod, which creates `eslint.config.mjs`, updates the `lint` script to `eslint .`, and removes the dead `eslint` block from `next.config`:
   ```bash
   npx @next/codemod@latest next-lint-to-eslint-cli .
   ```
   This unblocks P1 #14 (CI lint) and is a one-command, zero-config fix.
10. **`data/raw/README.md`** — source URL, retrieval date, SHA256 of each CSV. Establishes provenance for the chart numbers and is the lowest-effort credibility win in the repo.
11. **README rewrite** — what it is, screenshots, one-line Docker run, link to this design doc.

### P1 — should ship in v1 but not blocking

12. **Self-host tracking + Baby Buddy CSV export** — gated on `NEXT_PUBLIC_ENABLE_TRACKING=true`. localStorage persistence (so refresh keeps your data) and a button producing four Baby Buddy-format CSVs (per §6). Hosted mode leaves tracking off; this is opt-in self-host functionality.
13. **`SECURITY.md`** — point to GitHub private advisories.
14. **`CONTRIBUTING.md`** — even minimal (PR checklist, how to regenerate LMS tables, how to verify chart math).
15. **`.env.example`** — documents `BASE_PATH`, `PORT`, `HOSTNAME` from §9.
16. **GitHub Actions CI** — `npm run lint` + `npm run build` on PRs (depends on P0 #9 landing first).
17. **Chart precision nit** [V] — `components/GrowthChart.tsx:128,130` use `z = ±1.28` to draw the labeled 10th/90th percentile curves, which actually plots at the 10.027/89.973 percentile (off by ~1 g of weight at 24mo). Two-character fix: change to `±1.28155`. Sub-percentile error today, but a "labeled inaccuracy" we should clean before a public launch.
18. **Real date picker** — replace the 3-dropdown with `<input type="date">` (with fallback for older browsers).
19. **A11y pass** — `htmlFor` on labels, focus rings audit, keyboard tab order, viewport contrast.

### P2 — roadmap, not v1

20. **Corrected age toggle** for premature infants (gestational-age adjustment, first 2y).
21. **WHO 0–24mo** data switchover (see §7).
22. **Parental mid-parental-height prediction.**
23. **Printable PDF growth chart** (matches the look pediatricians staple into a baby book).
24. **Multi-child profiles** (still localStorage, just keyed).
25. **i18n** — at minimum es-US given the US parent audience.
26. **PWA / offline install.**
27. **Static export workflow** — gated on the [vercel/next.js#73427](https://github.com/vercel/next.js/issues/73427) `basePath` + `output: 'export'` bug clearing, or documenting the `trailingSlash: true` workaround in §8.3.

## 11. Threat model & privacy

Modelled assumption: the operator is trustworthy but defaults should protect the user even from the operator.

| Threat | Mitigation |
|---|---|
| Operator exfiltrates measurements | No network calls carry measurement data. Client-only. |
| Operator runs analytics on form interactions | No analytics in the OSS build. Operators who add their own own the disclosure. |
| Browser extension reads `localStorage` | Same risk as any local-storage app; called out in the privacy notice. |
| Stale/incorrect reference data | `data/raw/README.md` checksums + regeneration command in repo. |
| User mistakes the tool for medical advice | Persistent disclaimer (P0 item #3) + chart-level disclaimer (already present). |

Out of scope: protecting against a malicious *operator* who modifies the build to add tracking. Self-hosting puts that responsibility on whoever runs the bits.

## 12. License & attribution

- **Code:** Apache 2.0 (proposed). Chosen over MIT for the explicit patent grant — healthcare-adjacent code sits in a space where patent claims occasionally surface, and the grant is essentially free insurance. AGPL was considered and rejected (commonly blacklisted by enterprise self-hosters; we want clinics and NGOs to be able to deploy this).
- **CDC source data:** US Government work, public domain. Attribution preserved in `data/raw/README.md` and the in-app footer.
- **WHO data (if added in v1.1):** free with attribution per WHO terms.
- **Dependencies:** all MIT/ISC/Apache-2.0 (`next`, `react`, `recharts`, `lucide-react`, `date-fns`, `tailwindcss`). No copyleft.

## 13. Versioning & releases

- SemVer on the npm-style `package.json` version.
- Tagged Docker images (`vX.Y.Z` + `latest`).
- A release bumps the version, updates a `CHANGELOG.md`, and triggers a GitHub Actions workflow that publishes the image.
- Reference-data updates that change displayed percentiles count as **minor** version bumps (operators may want to pin); UI-only changes are patches.

## 14. Open questions

- **Should we ship the static export by default?** It widens the deployment surface (any CDN works) but doubles the supported-config matrix.
- **Do we want a one-line "demo data" button** so new visitors see a populated chart without typing? Helps the empty-state problem the audit flagged, but conflicts with the "local-only" story unless it's labeled clearly.
- **Sex input wording.** Current radio is "Male / Female". The CDC reference is sex-at-birth-binary; we should label it that way to be accurate, and add a one-line note for trans/intersex families about why the underlying data is binary.

---

**Next step:** triage the eleven P0 items into a single pre-launch PR. Validated against the actual code (`lib/growthCalculations.ts` math agrees with CDC tables to within 2.5×10⁻⁵%), against the working `next build` (3 pages prerender as static), and against external best practices ([Next.js self-hosting docs](https://nextjs.org/docs/app/guides/self-hosting), [Umami's `BASE_PATH` pattern](https://docs.umami.is/docs/environment-variables), [Excalidraw's local-persistence model](https://www.mintlify.com/excalidraw/excalidraw/guides/storage), [MDCalc's disclaimer pattern](https://www.mdcalc.com/disclaimer)). After P0 lands, cut `v1.0.0` and push the repo public.
