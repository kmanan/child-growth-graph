"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
} from "recharts";
import {
  MeasurementData,
  Metric,
  UnitSystem,
  calculatePercentile,
  computeBMI,
  valueFromZScore,
  cmToIn,
  kgToLb,
  formatWeight,
  formatLength,
  weightUnitLabel,
  lengthUnitLabel,
} from "@/lib/growthCalculations";
import { getLMSForAge, getTable } from "@/lib/growthData";

interface GrowthChartProps {
  measurements: MeasurementData[];
  sex: "male" | "female";
  type: Metric;
  units: UnitSystem;
}

// Pull the right canonical (kg/cm/bmi) value out of a measurement record.
function valueFor(m: MeasurementData, type: Metric): number | undefined {
  if (type === "weight") return m.weight;
  if (type === "length") return m.length;
  if (type === "headCircumference") return m.headCircumference;
  if (type === "bmi") {
    if (m.weight === undefined || m.length === undefined) return undefined;
    return computeBMI(m.weight, m.length);
  }
  return undefined;
}

// Convert a canonical value (kg or cm) to display units based on metric.
function toDisplayValue(v: number, type: Metric, units: UnitSystem): number {
  if (units === "metric") return v;
  if (type === "weight") return kgToLb(v);
  if (type === "length" || type === "headCircumference") return cmToIn(v);
  return v; // BMI is unitless (kg/m²) — same in both systems.
}

function displayUnit(type: Metric, units: UnitSystem): string {
  if (type === "weight") return weightUnitLabel(units);
  if (type === "length" || type === "headCircumference") return lengthUnitLabel(units);
  return "kg/m²"; // BMI
}

function chartTitle(type: Metric): string {
  if (type === "weight") return "Weight-for-Age";
  if (type === "length") return "Length / Height-for-Age";
  if (type === "headCircumference") return "Head Circumference-for-Age";
  return "BMI-for-Age";
}

function formatPercentile(p: number): string {
  const r = Math.round(p);
  const suffix = (n: number) =>
    n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  if (p < 1) return "Less than 1st percentile";
  if (p < 3) return `${r}% (Below 3rd percentile)`;
  if (p < 10) return `${r}% (Below 10th percentile)`;
  if (p > 97) return `${r}% (Above 97th percentile)`;
  if (p > 90) return `${r}% (Above 90th percentile)`;
  return `${r}${suffix(r)} percentile`;
}

function percentileExplanation(p: number, type: Metric): string {
  const r = Math.round(p);
  const compare = 100 - r;
  const word =
    type === "weight"
      ? "heavier"
      : type === "length"
      ? "taller"
      : type === "headCircumference"
      ? "larger head circumference"
      : "higher BMI";
  if (p < 10) return `About ${compare}% of children the same age have ${word}.`;
  if (p > 90) return `About ${r}% of children the same age have smaller measurements.`;
  return `About ${compare}% of children the same age have ${word}, and ${r}% have smaller measurements.`;
}

export default function GrowthChart({
  measurements,
  sex,
  type,
  units,
}: GrowthChartProps) {
  const relevant = measurements.filter((m) => valueFor(m, type) !== undefined);
  if (relevant.length === 0) return null;

  // Compute the chart's age domain. Use the table that covers the *latest*
  // measurement age, so the curves match the lookup used for the points.
  const maxAge = Math.max(...relevant.map((m) => m.ageMonths));
  const { table, minAge, maxAge: tableMax } = getTable(type, sex, maxAge);

  const chartMin = Math.max(0, minAge);
  const chartMax = Math.min(tableMax, Math.max(Math.ceil(maxAge) + 6, 36));
  const step = chartMax - chartMin > 60 ? 1 : 0.5;

  type Row = {
    age: number;
    p10: number;
    p50: number;
    p90: number;
  };
  const chartData: Row[] = [];
  for (let age = chartMin; age <= chartMax + 1e-6; age += step) {
    const lms = getLMSForAge(table, age);
    chartData.push({
      age: Math.round(age * 100) / 100,
      // Exact inverse-normal z-scores for the 10th and 90th percentiles.
      // Using ±1.28 (rounded) would plot at the 10.027 / 89.973 percentile.
      p10: Math.round(toDisplayValue(valueFromZScore(-1.28155, lms), type, units) * 100) / 100,
      p50: Math.round(toDisplayValue(valueFromZScore(0, lms), type, units) * 100) / 100,
      p90: Math.round(toDisplayValue(valueFromZScore(1.28155, lms), type, units) * 100) / 100,
    });
  }

  const measurementData = relevant.map((m) => {
    const canonical = valueFor(m, type)!;
    return {
      age: Math.round(m.ageMonths * 100) / 100,
      measurement: Math.round(toDisplayValue(canonical, type, units) * 100) / 100,
    };
  });

  // Build a per-measurement details list.
  const points = relevant.map((m) => {
    const canonical = valueFor(m, type)!;
    const result = calculatePercentile(canonical, type, sex, m.ageMonths);
    let formatted: string;
    if (type === "weight") formatted = formatWeight(canonical, units);
    else if (type === "length" || type === "headCircumference")
      formatted = formatLength(canonical, units);
    else formatted = `${canonical.toFixed(1)} kg/m²`;
    return {
      age: Math.round(m.ageMonths * 10) / 10,
      formatted,
      percentile: result.percentile,
      inRange: result.inRange,
      minAge: result.minAge,
      maxAge: result.maxAge,
    };
  });

  const unit = displayUnit(type, units);
  const anyOutOfRange = points.some((p) => !p.inRange);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
        {chartTitle(type)}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Percentiles compare your child against the CDC growth reference for
        their age and sex. 50th means average; 10th means smaller than most;
        90th means larger than most.
      </p>

      {anyOutOfRange && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
          One or more measurements fall outside the supported age range for
          this chart ({points[0].minAge}-{points[0].maxAge} months). Percentile
          values for those points are clamped to the chart edge and may not be
          accurate.
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="age"
            type="number"
            domain={[chartMin, chartMax]}
            label={{ value: "Age (months)", position: "insideBottom", offset: -5 }}
            stroke="#6b7280"
          />
          <YAxis
            type="number"
            domain={["auto", "auto"]}
            label={{ value: unit, angle: -90, position: "insideLeft" }}
            stroke="#6b7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />

          <Line type="monotone" dataKey="p10" stroke="#ef4444" strokeWidth={2}
            dot={false} name="10th percentile" strokeDasharray="5 5"
            isAnimationActive={false} connectNulls />
          <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2.5}
            dot={false} name="50th percentile"
            isAnimationActive={false} connectNulls />
          <Line type="monotone" dataKey="p90" stroke="#10b981" strokeWidth={2}
            dot={false} name="90th percentile" strokeDasharray="5 5"
            isAnimationActive={false} connectNulls />

          <Scatter data={measurementData} dataKey="measurement" fill="#8b5cf6" name="Your child"
            shape="circle" isAnimationActive={false} r={8}
            stroke="#6d28d9" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-3">
        {points.map((point, idx) => (
          <div key={idx} className="bg-purple-50 dark:bg-purple-900/30 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-300">
                {Math.floor(point.age)} months
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {point.formatted}
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {point.inRange ? formatPercentile(point.percentile) : "Outside chart range"}
              </span>
            </div>
            {point.inRange && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                {percentileExplanation(point.percentile, type)}
              </p>
            )}
          </div>
        ))}

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            <strong>Note:</strong> These numbers are directional and based on
            the CDC reference. Always consult your pediatrician for clinical
            assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
