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
  const chartData: Array<{
    age: number;
    p10: number;
    p50: number;
    p90: number;
    measurement?: number;
    percentile?: number;
  }> = [];

  // Generate percentile curves (10th, 50th, 90th)
  const maxAgeForChart = Math.max(Math.ceil(maxAge) + 6, 36); // At least 3 years of data
  for (let age = 0; age <= maxAgeForChart; age += 0.5) {
    const lms = getLMSForAge(dataSource, age);

    // Calculate values for different percentiles using inverse LMS
    // Z-scores: -1.28 (10th), 0 (50th), 1.28 (90th)
    const zScores = {
      p10: -1.28,
      p50: 0,
      p90: 1.28,
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
      p10: Math.round(calculateValueFromZScore(zScores.p10) * 10) / 10,
      p50: Math.round(calculateValueFromZScore(zScores.p50) * 10) / 10,
      p90: Math.round(calculateValueFromZScore(zScores.p90) * 10) / 10,
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

  const formatPercentile = (percentile: number): string => {
    const rounded = Math.round(percentile);
    
    // Handle special cases for 1st, 2nd, 3rd
    const getSuffix = (n: number) => {
      if (n === 1) return "st";
      if (n === 2) return "nd";
      if (n === 3) return "rd";
      return "th";
    };
    
    if (percentile < 1) {
      return "Less than 1%";
    } else if (percentile < 3) {
      return `${rounded}% (Below 3rd percentile)`;
    } else if (percentile < 10) {
      return `${rounded}% (Below 10th percentile)`;
    } else if (percentile > 97) {
      return `${rounded}% (Above 97th percentile)`;
    } else if (percentile > 90) {
      return `${rounded}% (Above 90th percentile)`;
    } else {
      return `${rounded}${getSuffix(rounded)} percentile`;
    }
  };

  const getPercentileExplanation = (percentile: number): string => {
    const rounded = Math.round(percentile);
    const comparePercent = 100 - rounded;
    
    const measurementType = type === "weight" ? "heavier" : type === "length" ? "taller" : "larger head circumference";
    
    if (percentile < 10) {
      return `About ${comparePercent}% of children the same age have ${measurementType}.`;
    } else if (percentile > 90) {
      return `About ${rounded}% of children the same age have smaller measurements.`;
    } else {
      return `About ${comparePercent}% of children the same age have ${measurementType}, and ${rounded}% have smaller measurements.`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{getTitle()}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Percentiles show how your baby compares to others the same age. 50th percentile means average, 10th means smaller than most, 90th means larger than most.
      </p>

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

          {/* Percentile curves - 10th, 50th, 90th */}
          <Line
            type="monotone"
            dataKey="p10"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="10th percentile"
            strokeDasharray="5 5"
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
            dataKey="p90"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="90th percentile"
            strokeDasharray="5 5"
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
      <div className="mt-4 space-y-3">
        {measurementPoints.map((point, idx) => (
          <div
            key={idx}
            className="bg-purple-50 dark:bg-purple-900/30 px-4 py-3 rounded-lg"
          >
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-300">
                {Math.floor(point.age)} months
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {point.measurement} {getUnit()}
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {formatPercentile(point.percentile)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {getPercentileExplanation(point.percentile)}
            </p>
          </div>
        ))}
        
        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            <strong>Note:</strong> These numbers are generic and directional. Please consult a pediatrician for accuracy and next steps.
          </p>
        </div>
      </div>
    </div>
  );
}
