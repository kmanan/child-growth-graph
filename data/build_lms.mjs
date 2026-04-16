// One-shot converter: CSV LMS files → TypeScript data tables.
// Run: node data/build_lms.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, "raw");
const OUT = join(__dirname, "..", "lib", "growthData.ts");

const FILES = [
  // file, infant?, exportPrefix
  { csv: "wtageinf.csv",   prefix: "weightInfant"  },
  { csv: "wtage.csv",      prefix: "weightChild"   },
  { csv: "lenageinf.csv",  prefix: "lengthInfant"  },
  { csv: "statage.csv",    prefix: "statureChild"  },
  { csv: "hcageinf.csv",   prefix: "headInfant"    },
  { csv: "bmiagerev.csv",  prefix: "bmiChild"      },
];

function parseCSV(path) {
  const text = readFileSync(path, "utf8").trim();
  const [, ...rows] = text.split(/\r?\n/);
  const boys = [];
  const girls = [];
  for (const row of rows) {
    const cols = row.split(",");
    const sex = +cols[0];
    const age = +cols[1];
    const L = +cols[2];
    const M = +cols[3];
    const S = +cols[4];
    if (!Number.isFinite(L) || !Number.isFinite(M) || !Number.isFinite(S)) continue;
    const entry = { age, L, M, S };
    (sex === 1 ? boys : girls).push(entry);
  }
  boys.sort((a, b) => a.age - b.age);
  girls.sort((a, b) => a.age - b.age);
  return { boys, girls };
}

function fmt(n) {
  // keep precision but drop noise
  return Number(n.toPrecision(8)).toString();
}

function emitArray(name, arr) {
  const rows = arr
    .map((e) => `  { age: ${fmt(e.age)}, L: ${fmt(e.L)}, M: ${fmt(e.M)}, S: ${fmt(e.S)} },`)
    .join("\n");
  return `export const ${name}: LMSEntry[] = [\n${rows}\n];\n`;
}

let out = `// AUTO-GENERATED from CDC LMS reference CSVs (data/raw/*.csv).
// Source: https://www.cdc.gov/growthcharts/data/zscore/
// Regenerate with: node data/build_lms.mjs
// Do not edit by hand.

export type LMSEntry = { age: number; L: number; M: number; S: number };

`;

for (const { csv, prefix } of FILES) {
  const { boys, girls } = parseCSV(join(RAW, csv));
  out += emitArray(`${prefix}Boys`, boys);
  out += "\n";
  out += emitArray(`${prefix}Girls`, girls);
  out += "\n";
}

// Lookup helpers
out += `export type Metric = "weight" | "length" | "headCircumference" | "bmi";
export type Sex = "male" | "female";

// Age boundary for switching from infant (0-36mo) to child (24-240mo) tables.
// CDC infant tables cover 0-36 months; child tables cover 24-240 months.
// We switch at 24 months to align with WHO/CDC clinical practice.
const INFANT_CUTOFF_MONTHS = 24;

export interface LMSLookup {
  table: LMSEntry[];
  inRange: boolean;
  minAge: number;
  maxAge: number;
}

export function getTable(metric: Metric, sex: Sex, ageMonths: number): LMSLookup {
  const useChild = ageMonths >= INFANT_CUTOFF_MONTHS;
  let table: LMSEntry[];
  switch (metric) {
    case "weight":
      table = useChild
        ? sex === "male" ? weightChildBoys : weightChildGirls
        : sex === "male" ? weightInfantBoys : weightInfantGirls;
      break;
    case "length":
      // "Length" (recumbent) under 24mo, "stature" (standing) at/after.
      table = useChild
        ? sex === "male" ? statureChildBoys : statureChildGirls
        : sex === "male" ? lengthInfantBoys : lengthInfantGirls;
      break;
    case "headCircumference":
      // Only available for infants in CDC reference (0-36 months).
      table = sex === "male" ? headInfantBoys : headInfantGirls;
      break;
    case "bmi":
      // Only meaningful 2+ years.
      table = sex === "male" ? bmiChildBoys : bmiChildGirls;
      break;
  }
  const minAge = table[0].age;
  const maxAge = table[table.length - 1].age;
  return {
    table,
    inRange: ageMonths >= minAge && ageMonths <= maxAge,
    minAge,
    maxAge,
  };
}

// Linear interpolation of LMS parameters between adjacent table rows.
// Clamps to the table's first/last row for ages outside the supported range
// rather than extrapolating (the previous version produced garbage).
export function getLMSForAge(table: LMSEntry[], ageMonths: number): LMSEntry {
  if (ageMonths <= table[0].age) return { ...table[0], age: ageMonths };
  if (ageMonths >= table[table.length - 1].age) {
    return { ...table[table.length - 1], age: ageMonths };
  }
  // Binary search for the bracketing pair.
  let lo = 0;
  let hi = table.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (table[mid].age <= ageMonths) lo = mid;
    else hi = mid;
  }
  const lower = table[lo];
  const upper = table[hi];
  const ratio = (ageMonths - lower.age) / (upper.age - lower.age);
  return {
    age: ageMonths,
    L: lower.L + (upper.L - lower.L) * ratio,
    M: lower.M + (upper.M - lower.M) * ratio,
    S: lower.S + (upper.S - lower.S) * ratio,
  };
}
`;

writeFileSync(OUT, out);
console.log(`Wrote ${OUT}`);
