# CDC growth reference data

These CSVs are the L/M/S parameter tables published by the U.S. Centers
for Disease Control and Prevention. They are converted into TypeScript
lookup tables by `data/build_lms.mjs` and consumed at runtime by
`lib/growthData.ts`.

## Source

All files retrieved from the CDC growth charts data files page:

- https://www.cdc.gov/growthcharts/percentile_data_files.htm
- Z-score / LMS files: https://www.cdc.gov/growthcharts/data/zscore/

**Retrieved:** 2026-04-16

## License

These files are works of the U.S. federal government and are in the
public domain (see https://www.usa.gov/government-works). No license
restrictions; CDC attribution is appreciated and preserved in `NOTICE`
and the in-app footer.

## Files used

| File | Coverage | Used for |
|---|---|---|
| `wtageinf.csv` | 0–36 months, both sexes | Weight-for-age (infant) |
| `wtage.csv` | 24–240 months, both sexes | Weight-for-age (child) |
| `lenageinf.csv` | 0–36 months, both sexes | Length-for-age (recumbent) |
| `statage.csv` | 24–240 months, both sexes | Stature-for-age (standing) |
| `hcageinf.csv` | 0–36 months, both sexes | Head-circumference-for-age |
| `bmiagerev.csv` | 24–240 months, both sexes | BMI-for-age |
| `wtleninf.csv` | infant, both sexes | Weight-for-length (vendored but not currently consumed by the UI) |

## SHA256 checksums

```
cbeea0e8d500ee15c652f3fdc45bcd02cb9c15d4d1e86f4d8048bbfea8d166e5  bmiagerev.csv
bf7e2d7af8fdb336f0b159e480414842136da960ea6a730b7e73d1060b4549e9  hcageinf.csv
ff28f37d359d8970962c619891bda48676dc34800ae64c2ee2e632264486896b  lenageinf.csv
45130d2a9d7c50c54a47e7ba626b66c61d4554bc2d901198cedd9419a53f7251  statage.csv
3406c9d125bcb69c062a9e84eb8c0209bfe9346542bdc1d308643750dcc241b7  wtage.csv
73221dd4de82eb9a70c1e6dd45c9b9e285fa1a3d7fff4971c3b85c1be6e5feed  wtageinf.csv
3dd616c8d11ad8ad5470929477609e6fc44cb2e5f7b95494061e1413a0034249  wtleninf.csv
```

Verify locally with `sha256sum data/raw/*.csv`.

## Regenerating the TypeScript tables

After replacing any CSV (e.g. CDC publishes an update):

```bash
node data/build_lms.mjs
```

This rewrites `lib/growthData.ts`. Verify the chart math still matches
the published P3/P10/P50/P90/P97 columns by running the validation
script (see `docs/oss-self-host-design.md` §10 for the validation
methodology).

## Note on WHO data

The CDC officially recommends WHO standards for ages 0–24 months (since
2010). This project currently bundles only CDC reference data; adding
WHO 0–24mo tables is on the v1.1 roadmap. If you regenerate from a
CDC-curated combined dataset, update the in-app attribution accordingly.
