// LMS Method for calculating percentiles and z-scores
// Based on CDC/WHO growth standards

export interface LMSData {
  ageMonths: number;
  L: number;
  M: number;
  S: number;
}

export interface MeasurementData {
  date: Date;
  ageMonths: number;
  weight?: number;
  length?: number;
  headCircumference?: number;
}

export interface PercentileResult {
  value: number;
  percentile: number;
  zScore: number;
}

// Calculate z-score using LMS method
export function calculateZScore(
  measurement: number,
  L: number,
  M: number,
  S: number
): number {
  if (L !== 0) {
    return (Math.pow(measurement / M, L) - 1) / (L * S);
  } else {
    return Math.log(measurement / M) / S;
  }
}

// Calculate percentile from z-score using cumulative distribution function
export function zScoreToPercentile(zScore: number): number {
  // Use a more accurate approximation of the standard normal CDF
  // This is the Abramowitz and Stegun approximation
  const sign = zScore >= 0 ? 1 : -1;
  const z = Math.abs(zScore) / Math.sqrt(2);
  
  // Error function approximation
  const t = 1 / (1 + 0.3275911 * z);
  const erf = 1 - (((((
    + 1.061405429  * t
    - 1.453152027) * t
    + 1.421413741) * t
    - 0.284496736) * t
    + 0.254829592) * t) * Math.exp(-z * z);
  
  // Convert to CDF
  const cdf = 0.5 * (1 + sign * erf);
  
  return cdf * 100;
}

// Gradual transition function from WHO to CDC (2-5 years)
export function gradualTransition(
  whoZScore: number,
  cdcZScore: number,
  ageMonths: number
): number {
  if (ageMonths < 24) return whoZScore;
  if (ageMonths >= 60) return cdcZScore;
  
  // Linear transition from 24 to 60 months
  const transitionProgress = (ageMonths - 24) / 36;
  return whoZScore * (1 - transitionProgress) + cdcZScore * transitionProgress;
}

// Calculate measurement percentile
export function calculatePercentile(
  measurement: number,
  lmsData: LMSData
): PercentileResult {
  const zScore = calculateZScore(
    measurement,
    lmsData.L,
    lmsData.M,
    lmsData.S
  );
  const percentile = zScoreToPercentile(zScore);
  
  return {
    value: measurement,
    percentile: Math.round(percentile * 10) / 10,
    zScore: Math.round(zScore * 100) / 100,
  };
}

// Get age in months from birth date (returns fractional months for accuracy)
export function getAgeInMonths(birthDate: Date, measurementDate: Date): number {
  // Calculate difference in milliseconds
  const diffMs = measurementDate.getTime() - birthDate.getTime();
  
  // Convert to days
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  // Convert days to months (using 30.4375 days per month average)
  const months = diffDays / 30.4375;
  
  return Math.max(0, months);
}
