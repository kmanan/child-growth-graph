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

// Calculate percentile from z-score
export function zScoreToPercentile(zScore: number): number {
  // Approximation using error function
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989423 * Math.exp((-zScore * zScore) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  if (zScore > 0) {
    return (1 - p) * 100;
  } else {
    return p * 100;
  }
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

// Get age in months from birth date
export function getAgeInMonths(birthDate: Date, measurementDate: Date): number {
  const years = measurementDate.getFullYear() - birthDate.getFullYear();
  const months = measurementDate.getMonth() - birthDate.getMonth();
  const days = measurementDate.getDate() - birthDate.getDate();
  
  let totalMonths = years * 12 + months;
  if (days < 0) {
    totalMonths -= 1;
  }
  
  return totalMonths;
}
