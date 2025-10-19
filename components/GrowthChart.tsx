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
import { MeasurementData, calculatePercentile } from "@/lib/growthCalculations";
import {
  weightForAgeBoys,
  weightForAgeGirls,
  lengthForAgeBoys,
  lengthForAgeGirls,
  headCircumferenceBoys,
  headCircumferenceGirls,
  getLMSForAge,
} from "@/lib/growthData";

interface GrowthChartProps {
  measurements: MeasurementData[];
  sex: "male" | "female";
  type: "weight" | "length" | "headCircumference";
}

export default function GrowthChart({
  measurements,
  sex,
  type,
}: GrowthChartProps) {
  // Filter measurements that have the relevant data
  const relevantMeasurements = measurements.filter((m) => {
    if (type === "weight") return m.weight !== undefined;
    if (type === "length") return m.length !== undefined;
    if (type === "headCircumference") return m.headCircumference !== undefined;
    return false;
  });

  if (relevantMeasurements.length === 0) return null;

  // Get appropriate data source
  let dataSource;
  if (type === "weight") {
    dataSource = sex === "male" ? weightForAgeBoys : weightForAgeGirls;
  } else if (type === "length") {
    dataSource = sex === "male" ? lengthForAgeBoys : lengthForAgeGirls;
  } else {
    dataSource =
      sex === "male" ? headCircumferenceBoys : headCircumferenceGirls;
  }

  // Prepare chart data with percentile curves
  const maxAge = Math.max(...relevantMeasurements.map((m) => m.ageMonths));
  const chartData = [];

  // Generate percentile curves (5th, 50th, 95th)
  for (let age = 0; age <= Math.ceil(maxAge) + 6; age += 1) {
    const lms = getLMSForAge(dataSource, age);

    // Calculate values for different percentiles using inverse LMS
    const p5 = lms.M * Math.pow(1 + lms.L * lms.S * -1.645, 1 / lms.L);
    const p50 = lms.M;
    const p95 = lms.M * Math.pow(1 + lms.L * lms.S * 1.645, 1 / lms.L);

    chartData.push({
      age,
      p5: Math.round(p5 * 10) / 10,
      p50: Math.round(p50 * 10) / 10,
      p95: Math.round(p95 * 10) / 10,
    });
  }

  // Add actual measurements as scatter plot data
  const measurementPoints = relevantMeasurements.map((m) => {
    const value =
      type === "weight"
        ? m.weight!
        : type === "length"
        ? m.length!
        : m.headCircumference!;

    const lms = getLMSForAge(dataSource, m.ageMonths);
    const result = calculatePercentile(value, lms);

    return {
      age: Math.round(m.ageMonths * 10) / 10,
      measurement: value,
      percentile: result.percentile,
    };
  });

  const getTitle = () => {
    if (type === "weight") return "Weight-for-Age";
    if (type === "length") return "Length-for-Age";
    return "Head Circumference-for-Age";
  };

  const getUnit = () => {
    return type === "weight" ? "kg" : "cm";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{getTitle()}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="age"
            label={{ value: "Age (months)", position: "insideBottom", offset: -5 }}
            stroke="#6b7280"
          />
          <YAxis
            label={{ value: getUnit(), angle: -90, position: "insideLeft" }}
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

          {/* Percentile curves */}
          <Line
            type="monotone"
            dataKey="p5"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="5th percentile"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="50th percentile"
          />
          <Line
            type="monotone"
            dataKey="p95"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="95th percentile"
            strokeDasharray="5 5"
          />

          {/* Actual measurements as visible scatter points */}
          <Scatter
            data={measurementPoints}
            fill="#8b5cf6"
            name="Baby's measurements"
            shape="circle"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Measurement details */}
      <div className="mt-4 space-y-2">
        {measurementPoints.map((point, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center text-sm bg-purple-50 px-4 py-2 rounded-lg"
          >
            <span className="text-gray-600">
              {Math.floor(point.age)} months
            </span>
            <span className="font-semibold text-gray-800">
              {point.measurement} {getUnit()}
            </span>
            <span className="text-purple-600 font-medium">
              {point.percentile}th percentile
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
