"use client";

// Self-host persistence + Baby Buddy CSV export.
// Gated by NEXT_PUBLIC_ENABLE_TRACKING — when false (hosted mode), all
// functions no-op or return safe defaults so the rest of the app doesn't
// need to branch.

import type { MeasurementData } from "./growthCalculations";

export const TRACKING_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_TRACKING === "true";

const STORAGE_KEY = "growth-charts.v1";

type ChildInfo = {
  name: string;
  sex: "male" | "female";
  birthDate: Date | null;
};

type StoredSnapshot = {
  version: 1;
  childInfo: { name: string; sex: "male" | "female"; birthDateISO: string | null };
  measurements: Array<{
    dateISO: string;
    ageMonths: number;
    weight?: number;
    length?: number;
    headCircumference?: number;
  }>;
};

export function loadSnapshot():
  | { childInfo: ChildInfo; measurements: MeasurementData[] }
  | null {
  if (!TRACKING_ENABLED || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSnapshot;
    if (parsed.version !== 1) return null;
    return {
      childInfo: {
        name: parsed.childInfo.name,
        sex: parsed.childInfo.sex,
        birthDate: parsed.childInfo.birthDateISO
          ? new Date(parsed.childInfo.birthDateISO)
          : null,
      },
      measurements: parsed.measurements.map((m) => ({
        date: new Date(m.dateISO),
        ageMonths: m.ageMonths,
        weight: m.weight,
        length: m.length,
        headCircumference: m.headCircumference,
      })),
    };
  } catch {
    return null;
  }
}

export function saveSnapshot(
  childInfo: ChildInfo,
  measurements: MeasurementData[]
): void {
  if (!TRACKING_ENABLED || typeof window === "undefined") return;
  try {
    const snapshot: StoredSnapshot = {
      version: 1,
      childInfo: {
        name: childInfo.name,
        sex: childInfo.sex,
        birthDateISO: childInfo.birthDate
          ? childInfo.birthDate.toISOString()
          : null,
      },
      measurements: measurements.map((m) => ({
        dateISO: m.date.toISOString(),
        ageMonths: m.ageMonths,
        weight: m.weight,
        length: m.length,
        headCircumference: m.headCircumference,
      })),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Quota exceeded or storage disabled — silently drop. Next save retries.
  }
}

export function clearSnapshot(): void {
  if (!TRACKING_ENABLED || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ---- Baby Buddy CSV export -------------------------------------------------
// Format matches https://github.com/babybuddy/babybuddy/tree/master/core/tests/import
// Columns: child_id,<metric>,date,notes
// Date format: YYYY-MM-DD
// Units: raw decimals (kg / cm). Baby Buddy stores values without unit
//   encoding — users must match their Baby Buddy install's display units.

import { computeBMI } from "./growthCalculations";
import { kgToLb, cmToIn } from "./growthCalculations";
import type { UnitSystem } from "./growthCalculations";

type BabyBuddyMetric = "weight" | "height" | "head_circumference" | "bmi";

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCSV(
  metric: BabyBuddyMetric,
  rows: Array<{ value: number; date: Date }>,
  childId: number
): string {
  const header = `child_id,${metric},date,notes\n`;
  const body = rows
    .map((r) => `${childId},${r.value},${isoDate(r.date)},`)
    .join("\n");
  return header + body + (body ? "\n" : "");
}

function downloadFile(filename: string, content: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  // csvEscape is defined for future use (notes with commas/quotes), keep it
  // referenced so tree-shaking doesn't strip it before we use it.
  void csvEscape;
}

export type ExportUnits = "metric" | "us";

export function exportBabyBuddyCSVs(
  measurements: MeasurementData[],
  units: ExportUnits,
  childId: number = 1
): { exported: BabyBuddyMetric[] } {
  const exported: BabyBuddyMetric[] = [];

  const convertWeight = (kg: number) => (units === "us" ? kgToLb(kg) : kg);
  const convertLength = (cm: number) => (units === "us" ? cmToIn(cm) : cm);
  const round = (n: number) => Math.round(n * 100) / 100;

  const weightRows = measurements
    .filter((m) => m.weight !== undefined)
    .map((m) => ({ value: round(convertWeight(m.weight!)), date: m.date }));
  if (weightRows.length) {
    downloadFile("weight.csv", buildCSV("weight", weightRows, childId));
    exported.push("weight");
  }

  const heightRows = measurements
    .filter((m) => m.length !== undefined)
    .map((m) => ({ value: round(convertLength(m.length!)), date: m.date }));
  if (heightRows.length) {
    downloadFile("height.csv", buildCSV("height", heightRows, childId));
    exported.push("height");
  }

  const hcRows = measurements
    .filter((m) => m.headCircumference !== undefined)
    .map((m) => ({
      value: round(convertLength(m.headCircumference!)),
      date: m.date,
    }));
  if (hcRows.length) {
    downloadFile(
      "headcircumference.csv",
      buildCSV("head_circumference", hcRows, childId)
    );
    exported.push("head_circumference");
  }

  const bmiRows = measurements
    .filter((m) => m.weight !== undefined && m.length !== undefined)
    .map((m) => ({
      value: round(computeBMI(m.weight!, m.length!)),
      date: m.date,
    }));
  if (bmiRows.length) {
    downloadFile("bmi.csv", buildCSV("bmi", bmiRows, childId));
    exported.push("bmi");
  }

  return { exported };
}
