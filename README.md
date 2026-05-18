# cdc-growth-charts

A privacy-first pediatric growth chart viewer built on the CDC growth reference (0–20 years). Plot a child's weight, length / height, head circumference, and BMI against the same percentile curves a US pediatric EMR uses.

Two modes from one codebase:

- **Hosted** (e.g. [krytonlabs.com/childgrowth](https://krytonlabs.com/childgrowth)) — ephemeral "quick check and leave." Nothing persists. Refresh = gone.
- **Self-host** — same UI plus opt-in localStorage tracking and one-click export to [Baby Buddy](https://github.com/babybuddy/babybuddy) CSV format for when you outgrow this tool.

## Quickstart (self-host)

```bash
git clone https://github.com/kmanan/child-growth-graph.git
cd child-growth-graph
docker compose up -d
```

Then open <http://localhost:3000>. That's it.

To bind to a different port: `HOST_PORT=8080 docker compose up -d`.

## What it does

- Plots weight-for-age, length/stature-for-age, head-circumference-for-age, and BMI-for-age against the CDC reference's 10th / 50th / 90th percentile curves.
- Computes percentile and z-score for any measurement, with "outside chart range" handling for ages beyond the table's support.
- Toggle between US (lb / in) and metric (kg / cm) input and display.
- Dark mode.
- No backend, no database, no analytics, no telemetry. The entire app runs in the browser; the server only serves the static bundle.

Validated to within 2.5×10⁻⁵% relative error against the CDC's published P3/P10/P50/P90/P97 columns across all 1,536 reference rows. See `docs/oss-self-host-design.md` for the methodology.

## Self-host features

When `NEXT_PUBLIC_ENABLE_TRACKING=true` is baked into the build (the default for the Dockerfile), two extra capabilities turn on:

1. **localStorage persistence.** Measurements survive refreshes. Schema is versioned (`growth-charts.v1`) and corrupt entries fall back to empty.
2. **Baby Buddy CSV export.** A single click produces four downloads matching [Baby Buddy's import format](https://github.com/babybuddy/babybuddy/tree/master/core/tests/import) exactly:
   - `weight.csv` — `child_id,weight,date,notes`
   - `height.csv` — `child_id,height,date,notes`
   - `headcircumference.csv` — `child_id,head_circumference,date,notes`
   - `bmi.csv` — `child_id,bmi,date,notes`

   `child_id` defaults to `1` (Baby Buddy's first-child default). Edit the CSV before importing if your Baby Buddy install uses a different ID. Values export in whatever unit system you're currently viewing — the button labels the units explicitly.

## Configuration

| Variable | Default | Scope | Purpose |
|---|---|---|---|
| `BASE_PATH` | `""` | **Build-time** (Docker `ARG`) | URL prefix for sub-path mounting. Inlined into client bundle; requires rebuild. |
| `NEXT_PUBLIC_ENABLE_TRACKING` | `"true"` (Docker), `"false"` (npm) | **Build-time** | Enables localStorage + CSV export. |
| `HOST_PORT` | `3000` | Runtime (compose) | Port to expose on the host. |
| `PORT` | `3000` | Runtime (container) | Internal Next.js listen port. |

### Sub-path mounting (e.g. behind a reverse proxy at `/childgrowth`)

`basePath` is a Next.js build-time inlined value, so this requires rebuilding the image:

```bash
docker build --build-arg BASE_PATH=/childgrowth -t cdc-growth-charts .
docker run -d -p 3000:3000 cdc-growth-charts
```

Then proxy `proxy_pass http://127.0.0.1:3000/childgrowth;` — do **not** strip the prefix; Next expects it intact. See `docs/oss-self-host-design.md` §8.4 for the full discussion.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint         # ESLint (flat config)
node data/build_lms.mjs  # regenerate lib/growthData.ts from data/raw/*.csv
```

Node ≥ 20.9 required.

## Data source

CDC L/M/S parameter tables (public domain). See [`data/raw/README.md`](data/raw/README.md) for source URLs, retrieval date, and SHA256 checksums.

## Not medical advice

This is a viewer/calculator, not a medical device. Numbers shown are directional and based on the CDC reference. Always consult your pediatrician for clinical assessment. See `docs/oss-self-host-design.md` §2 for full scope/non-goals.

## License

[Apache 2.0](LICENSE). See [`NOTICE`](NOTICE) for attribution.

## Design doc

[`docs/oss-self-host-design.md`](docs/oss-self-host-design.md) — architecture, deployment, threat model, roadmap.

---

Migrating to a fuller baby tracker? [Baby Buddy](https://github.com/babybuddy/babybuddy) is the canonical self-host option, and the CSV export here drops straight into its import flow.
