// Validate CDC LMS math against the published percentile columns.
// Run: npm run validate:data
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, "raw");

const FILES = [
  "wtageinf.csv",
  "wtage.csv",
  "lenageinf.csv",
  "statage.csv",
  "hcageinf.csv",
  "bmiagerev.csv",
];

const CHECKS = [
  { name: "P3", z: -1.8807936081512509 },
  { name: "P10", z: -1.2815515655446004 },
  { name: "P50", z: 0 },
  { name: "P90", z: 1.2815515655446004 },
  { name: "P97", z: 1.8807936081512509 },
];

function valueFromZScore(z, L, M, S) {
  if (L !== 0) return M * Math.pow(1 + L * S * z, 1 / L);
  return M * Math.exp(S * z);
}

let rowCount = 0;
let maxRelativeError = 0;
let worst = null;

for (const file of FILES) {
  const text = readFileSync(join(RAW, file), "utf8").trim();
  const [headerLine, ...rows] = text.split(/\r?\n/);
  const headers = headerLine.split(",");
  const indexFor = Object.fromEntries(headers.map((name, index) => [name, index]));

  for (const row of rows) {
    const cols = row.split(",").map(Number);
    const sex = cols[indexFor.Sex];
    const age = cols[indexFor.Agemos];
    const L = cols[indexFor.L];
    const M = cols[indexFor.M];
    const S = cols[indexFor.S];
    if (![sex, age, L, M, S].every(Number.isFinite)) continue;
    rowCount += 1;

    for (const check of CHECKS) {
      const expected = cols[indexFor[check.name]];
      if (!Number.isFinite(expected)) continue;
      const actual = valueFromZScore(check.z, L, M, S);
      const relativeError = Math.abs(actual - expected) / Math.max(Math.abs(expected), 1);

      if (relativeError > maxRelativeError) {
        maxRelativeError = relativeError;
        worst = { file, sex, age, percentile: check.name, expected, actual };
      }
    }
  }
}

const percentError = maxRelativeError * 100;
const tolerance = 2.5e-5;

if (percentError > tolerance) {
  console.error(
    `CDC LMS validation failed: max relative error ${percentError}% exceeds ${tolerance}%`,
    worst
  );
  process.exit(1);
}

console.log(
  `Validated ${rowCount} CDC LMS rows; max relative error ${percentError}% at ${worst.file} ${worst.percentile}.`
);
