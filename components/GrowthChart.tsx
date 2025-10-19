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

  // Generate percentile curves (5th, 10th, 25th, 50th, 75th, 90th, 95th) with finer granularity
  const maxAgeForChart = Math.max(Math.ceil(maxAge) + 6, 36); // At least 3 years of data
  for (let age = 0; age <= maxAgeForChart; age += 0.5) {
    const lms = getLMSForAge(dataSource, age);

    // Calculate values for different percentiles using inverse LMS
    // Z-scores: -1.88 (3rd), -1.645 (5th), -1.28 (10th), -0.67 (25th), 0 (50th), 0.67 (75th), 1.28 (90th), 1.645 (95th), 1.88 (97th)
    const zScores = {
      p3: -1.88,
      p5: -1.645,
      p10: -1.28,
      p25: -0.674,
      p50: 0,
      p75: 0.674,
      p90: 1.28,
      p95: 1.645,
      p97: 1.88
    };

    const calculateValueFromZScore = (z: number) => {
      if (lms.L !== 0) {
        return lms.M * Math.pow(1 + lms.L * lms.S * z, 1 / lms.L);
      } else {
        return lms.M * Math.exp(lms.S * z);
      }
    };

    chartData.push({
      age: Math.round(age * 100) / 100,
      p3: Math.round(calculateValueFromZScore(zScores.p3) * 10) / 10,
      p5: Math.round(calculateValueFromZScore(zScores.p5) * 10) / 10,
      p10: Math.round(calculateValueFromZScore(zScores.p10) * 10) / 10,
      p25: Math.round(calculateValueFromZScore(zScores.p25) * 10) / 10,
      p50: Math.round(calculateValueFromZScore(zScores.p50) * 10) / 10,
      p75: Math.round(calculateValueFromZScore(zScores.p75) * 10) / 10,
      p90: Math.round(calculateValueFromZScore(zScores.p90) * 10) / 10,
      p95: Math.round(calculateValueFromZScore(zScores.p95) * 10) / 10,
      p97: Math.round(calculateValueFromZScore(zScores.p97) * 10) / 10,
    });
  }

  // Mark measurement points in the chart data
  relevantMeasurements.forEach((m) => {
    const value =
      type === "weight"
        ? m.weight!
        : type === "length"
        ? m.length!
        : m.headCircumference!;

    const lms = getLMSForAge(dataSource, m.ageMonths);
    const result = calculatePercentile(value, lms);

    // Find the closest age point in chartData (within 0.1 months)
    const closestPoint = chartData.reduce((closest, point) => {
      const distance = Math.abs(point.age - m.ageMonths);
      const closestDistance = Math.abs(closest.age - m.ageMonths);
      return distance < closestDistance ? point : closest;
    }, chartData[0]);
    
    if (closestPoint && Math.abs(closestPoint.age - m.ageMonths) < 0.25) {
      // Add measurement to existing point
      (closestPoint as any).measurement = value;
      (closestPoint as any).percentile = result.percentile;
    }
  });

  // Sort by age
  chartData.sort((a, b) => a.age - b.age);

  // Debug logging
  console.log(`\n========= GrowthChart: ${type} =========`);
  console.log(`Total data points: ${chartData.length}`);
  console.log(`Age range: ${chartData[0]?.age} to ${chartData[chartData.length - 1]?.age}`);
  console.log('First 5 data points:');
  console.table(chartData.slice(0, 5));
  console.log('Data points with measurements:');
  console.table(chartData.filter(d => d.measurement !== undefined));
  
  // Extract measurement points for display below chart
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{getTitle()}</h3>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="age"
            type="number"
            domain={[0, 'dataMax']}
            label={{ value: "Age (months)", position: "insideBottom", offset: -5 }}
            stroke="#6b7280"
          />
          <YAxis
            type="number"
            domain={['auto', 'auto']}
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

          {/* Percentile curves - multiple curves for better visualization */}
          <Line
            type="monotone"
            dataKey="p3"
            stroke="#dc2626"
            strokeWidth={1.5}
            dot={false}
            name="3rd percentile"
            strokeDasharray="3 3"
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="p5"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="5th percentile"
            strokeDasharray="5 5"
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="p10"
            stroke="#f59e0b"
            strokeWidth={1.5}
            dot={false}
            name="10th percentile"
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="p25"
            stroke="#84cc16"
            strokeWidth={1.5}
            dot={false}
            name="25th percentile"
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            name="50th percentile"
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="p75"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            dot={false}
            name="75th percentile"
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="p90"
            stroke="#ec4899"
            strokeWidth={1.5}
            dot={false}
            name="90th percentile"
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="p95"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="95th percentile"
            strokeDasharray="5 5"
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="p97"
            stroke="#059669"
            strokeWidth={1.5}
            dot={false}
            name="97th percentile"
            strokeDasharray="3 3"
            isAnimationActive={false}
            connectNulls={true}
          />

          {/* Actual measurements as visible scatter points */}
          <Scatter
            dataKey="measurement"
            fill="#8b5cf6"
            name="Baby's measurements"
            shape="circle"
            isAnimationActive={false}
            r={8}
            stroke="#6d28d9"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Measurement details */}
      <div className="mt-4 space-y-2">
        {measurementPoints.map((point, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center text-sm bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-lg"
          >
            <span className="text-gray-600 dark:text-gray-300">
              {Math.floor(point.age)} months
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {point.measurement} {getUnit()}
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              {point.percentile}th percentile
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
