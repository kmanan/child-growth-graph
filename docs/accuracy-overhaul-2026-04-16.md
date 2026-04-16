# Accuracy overhaul — 2026-04-16

## Why this change

A parent using the app reported that the percentiles it produced never
matched what their son's pediatrician reported. An audit confirmed the
concern: the app's numbers really were wrong, for several independent
reasons. This document describes each problem, how it was fixed, and the
expected behavior going forward.

## Summary

| # | Problem | Impact | Fix |
|---|---------|--------|-----|
| 1 | Unit mismatch — app only accepted kg / cm; US doctors report lb / in | Anyone entering lb as kg at 12 mo scored z ≈ +6.4 (off the chart) | Added a US (lb / oz / in) ↔ Metric (kg / cm) toggle, defaulting to US |
| 2 | Age range capped at 60 months with a lookup bug | Any measurement past 5 years produced garbage extrapolation | Extended to 240 months (20 y) and rewrote `getLMSForAge` to clamp at edges |
| 3 | Abridged 17-row LMS tables + linear interpolation | 1–5 percentile points of drift between samples | Replaced with the full CDC LMS reference (per-half-month, 0–240 mo) |
| 4 | README promised a WHO → CDC gradual transition that was never wired in | Misleading documentation | Removed unused `gradualTransition()`; now uses CDC throughout (matches most US EMRs); README updated |
| 5 | No BMI-for-age | Missing the percentile US pediatricians most commonly cite for kids 2+ | Added BMI-for-age chart, rendered automatically when a child is 2+ with both weight and height |

## Detailed changes

### 1. Unit toggle (lb / oz / in)

**Files:** `components/MeasurementForm.tsx`, `app/page.tsx`,
`lib/growthCalculations.ts`.

- New `UnitSystem = "metric" | "us"` state lives at the page level and is
  threaded to the form, charts, and the "Latest Measurements" tile.
- The form defaults to **US**. Weight is entered as `lb` + optional `oz`;
  length and head as `in`.
- Inputs are converted to canonical **kg / cm** before storage via
  `lbToKg`, `inToCm`. All internal math stays in SI so the LMS lookup
  keeps working against CDC tables (which are published in metric).
- Display helpers `formatWeight`, `formatLength`, `formatLbOz` render
  values in the active unit system. Infant weights render as
  `"X lb Y oz"` under ~30 lb; above that switches to decimal `lb` for
  readability.
- Chart Y-axis, percentile curves, and measurement dots all convert to the
  active unit so the numeric ticks match what the user typed.

### 2. Age-range bug in `getLMSForAge`

**File:** `lib/growthData.ts`.

The previous implementation initialized bracketing pointers to the first
and last rows of the table and only updated them when an exact bracket
was found inside the loop. For any age outside the table's range (e.g.
72 months against a 0–60 month table), the loop never matched, so the
function linearly interpolated between the **age 0** and **age 60** rows
using `ratio = (age - 0) / (60 - 0)`. Above 60 months, that ratio
exceeded 1 and produced nonsensical LMS parameters.

Rewritten version:

- Early-clamps to `table[0]` when `ageMonths <= firstAge`.
- Early-clamps to `table[last]` when `ageMonths >= lastAge`.
- Uses a binary search for the bracketing pair in between.
- `getTable()` reports `inRange`, `minAge`, `maxAge` so the chart can
  surface an amber warning when a measurement is outside the supported
  range (no longer silently wrong).

### 3. Full CDC LMS tables

**Files:** `data/raw/*.csv` (sources), `data/build_lms.mjs` (converter),
`lib/growthData.ts` (generated output, do not edit by hand).

Sources fetched from the CDC's official growth-chart data page:
<https://www.cdc.gov/growthcharts/percentile_data_files.htm>

| File | Coverage | Use |
|------|----------|-----|
| `wtageinf.csv`  | weight, 0–36 mo | infant weight-for-age |
| `wtage.csv`     | weight, 24–240 mo | child weight-for-age |
| `lenageinf.csv` | length, 0–36 mo | infant length-for-age (recumbent) |
| `statage.csv`   | stature, 24–240 mo | child height-for-age (standing) |
| `hcageinf.csv`  | head, 0–36 mo | head circumference (infants only) |
| `bmiagerev.csv` | BMI, 24–240 mo | BMI-for-age |

Row counts in the generated tables:

- Infant tables: ~37–38 entries each (half-month intervals).
- Child tables: ~218–219 entries each (half-month intervals).
- Total generated file: ~1650 lines.

`getTable(metric, sex, ageMonths)` picks the right table. It switches
from infant to child tables at 24 months, which matches the clinical
convention and handles the natural measurement change at age 2
(recumbent *length* → standing *stature*).

**Regenerating the tables:**

```bash
node data/build_lms.mjs
```

The converter skips stray header rows (CDC's `lenageinf.csv` and
`bmiagerev.csv` both contain a second `Sex,Agemos,...` header line
separating boys from girls).

### 4. WHO / CDC transition claim removed

The README and page footer previously advertised a "gradual WHO → CDC
transition (2–5 years)" based on Daymont et al. The `gradualTransition()`
helper in `growthCalculations.ts` implemented a linear blend, but nothing
ever called it, so the claim was cosmetic.

Options considered:

- **(a)** Fetch WHO 0–24 mo LMS tables and blend them with CDC 2–20 y.
- **(b)** Use CDC tables consistently (what most US pediatric EMRs do).

Chose (b) because the WHO redistribution is not available from CDC under
a predictable CSV URL, and because using the same reference as the
user's pediatrician is more important than chasing the nominally-correct
WHO/CDC split. Removed the dead helper, updated README, and updated the
page footer.

### 5. BMI-for-age (2–20 y)

**Files:** `lib/growthCalculations.ts`, `components/GrowthChart.tsx`,
`app/page.tsx`.

- New `computeBMI(weightKg, lengthCm)` helper (kg / m²).
- `Metric` type now includes `"bmi"`. `getTable` routes BMI to
  `bmiChildBoys` / `bmiChildGirls`.
- `GrowthChart` accepts `type="bmi"`; it pulls weight + length from each
  measurement and derives BMI on the fly — no new data shape required.
- The BMI chart only renders on the page when **any** measurement has
  age ≥ 24 months **and** both weight and length present. Otherwise it
  stays hidden so infant-only users aren't confused.

## Verification

### Type check

```
$ npx tsc --noEmit
exit=0
```

### Production build

```
$ npm run build
✓ Compiled successfully
Route (app)                              Size     First Load JS
┌ ○ /                                    148 kB          236 kB
```

### Spot-check percentiles

Ran a standalone script against the raw CDC CSVs to confirm the
generated tables produce sensible percentiles:

| Case                                          | z-score | Percentile |
|-----------------------------------------------|---------|------------|
| 12 mo boy, 10.0 kg (infant tbl)               | -0.28   | 39.1 %     |
| 24 mo boy, 12.6 kg (child tbl)                | -0.05   | 47.9 %     |
| 72 mo boy, 21.0 kg                            | +0.11   | 54.4 %     |
| **80 mo boy, 25.5 kg (was broken — see #2)**  | +0.87   | 80.8 %     |
| 120 mo boy, 32 kg                             | +0.01   | 50.5 %     |
| 120 mo boy, 140 cm stature                    | +0.21   | 58.3 %     |
| 120 mo boy, BMI 16.5                          | -0.06   | 47.5 %     |
| **22 lb baby entered as "22" in the old form (kg)** | +6.42   | 100.0 %    |

The last row demonstrates how badly the unit confusion previously
scored kids: a perfectly normal 22-pound 1-year-old (~50th percentile)
was being reported off the top of the chart.

## Files changed

```
modified:   README.md
modified:   app/page.tsx
modified:   components/GrowthChart.tsx
modified:   components/MeasurementForm.tsx
modified:   lib/growthCalculations.ts
modified:   lib/growthData.ts        (auto-generated, ~1650 lines)
added:      data/build_lms.mjs
added:      data/raw/bmiagerev.csv
added:      data/raw/hcageinf.csv
added:      data/raw/lenageinf.csv
added:      data/raw/statage.csv
added:      data/raw/wtage.csv
added:      data/raw/wtageinf.csv
added:      data/raw/wtleninf.csv    (not yet used; reserved for weight-for-length)
added:      docs/accuracy-overhaul-2026-04-16.md
```

## Follow-ups not in this change

- Weight-for-length (0–24 mo, from `wtleninf.csv`). Downloaded but not
  plumbed into the UI. A natural next addition when a user wants to
  track proportionality without caring about age.
- Weight-for-stature (2–5 y). Similar.
- Optional: fetch WHO 0–24 mo tables and offer a "WHO infant / CDC
  child" preference for users whose clinicians (or countries) use WHO.
- Persistence: measurements are still in-memory only. localStorage or a
  simple backend would let families track growth across visits.
