// LMS percentile/z-score math against CDC growth references.
// Tables and getLMSForAge live in growthData.ts (auto-generated).

import {
  getLMSForAge,
  getTable,
  type LMSEntry,
  type Metric,
  type Sex,
} from "./growthData";

export type { LMSEntry, Metric, Sex };

export type UnitSystem = "metric" | "us";

export interface MeasurementData {
  date: Date;
  ageMonths: number;
  // Canonical units regardless of UI selection: kg, cm.
  weight?: number;
  length?: number;
  headCircumference?: number;
}

export interface PercentileResult {
  value: number;
  percentile: number;
  zScore: number;
  ageMonths: number;
  inRange: boolean;
  minAge: number;
  maxAge: number;
}

// Z-score from measurement using LMS parameters.
export function calculateZScore(
  measurement: number,
  L: number,
  M: number,
  S: number
): number {
  if (L !== 0) {
    return (Math.pow(measurement / M, L) - 1) / (L * S);
  }
  return Math.log(measurement / M) / S;
}

// Inverse: measurement value at a given z-score (used to draw percentile curves).
export function valueFromZScore(z: number, lms: LMSEntry): number {
  if (lms.L !== 0) {
    return lms.M * Math.pow(1 + lms.L * lms.S * z, 1 / lms.L);
  }
  return lms.M * Math.exp(lms.S * z);
}

// Standard normal CDF (Abramowitz & Stegun erf approximation).
export function zScoreToPercentile(zScore: number): number {
  const sign = zScore >= 0 ? 1 : -1;
  const z = Math.abs(zScore) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * z);
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-z * z);
  return 0.5 * (1 + sign * erf) * 100;
}

// Top-level: percentile for a measurement of a given metric/sex/age.
export function calculatePercentile(
  measurement: number,
  metric: Metric,
  sex: Sex,
  ageMonths: number
): PercentileResult {
  const { table, inRange, minAge, maxAge } = getTable(metric, sex, ageMonths);
  const lms = getLMSForAge(table, ageMonths);
  const zScore = calculateZScore(measurement, lms.L, lms.M, lms.S);
  const percentile = zScoreToPercentile(zScore);
  return {
    value: measurement,
    percentile: Math.round(percentile * 10) / 10,
    zScore: Math.round(zScore * 100) / 100,
    ageMonths,
    inRange,
    minAge,
    maxAge,
  };
}

// Fractional months between two dates (uses average month length).
export function getAgeInMonths(birthDate: Date, measurementDate: Date): number {
  const diffMs = measurementDate.getTime() - birthDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Math.max(0, diffDays / 30.4375);
}

// BMI in kg/m² from canonical kg + cm.
export function computeBMI(weightKg: number, lengthCm: number): number {
  const meters = lengthCm / 100;
  return weightKg / (meters * meters);
}

// Unit conversions ----------------------------------------------------------

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const inToCm = (i: number) => i * CM_PER_IN;
export const cmToIn = (cm: number) => cm / CM_PER_IN;

// "8 lb 6 oz" style formatter for infant weights.
export function formatLbOz(kg: number): string {
  const totalOz = kgToLb(kg) * 16;
  const lb = Math.floor(totalOz / 16);
  const oz = Math.round(totalOz - lb * 16);
  if (oz === 16) return `${lb + 1} lb 0 oz`;
  return `${lb} lb ${oz} oz`;
}

// Display formatters: take canonical kg/cm and produce a string in chosen units.
export function formatWeight(kg: number, units: UnitSystem): string {
  if (units === "us") {
    // Use lb+oz under ~30 lb (infants/toddlers); decimal lb above for readability.
    return kg < 13.6 ? formatLbOz(kg) : `${kgToLb(kg).toFixed(1)} lb`;
  }
  return `${kg.toFixed(2)} kg`;
}

export function formatLength(cm: number, units: UnitSystem): string {
  return units === "us" ? `${cmToIn(cm).toFixed(1)} in` : `${cm.toFixed(1)} cm`;
}

export const weightUnitLabel = (u: UnitSystem) => (u === "us" ? "lb" : "kg");
export const lengthUnitLabel = (u: UnitSystem) => (u === "us" ? "in" : "cm");
