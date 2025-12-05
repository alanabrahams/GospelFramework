import type { AssessmentResponse, CalculatedScores } from "@/types/assessment-schema";

/**
 * Calculate the average of an array of numbers
 */
function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate point scores (averages of sub-questions) from assessment response
 */
export function calculatePointScores(
  assessment: AssessmentResponse
): CalculatedScores["points"] {
  return {
    // Section 1: Worship
    scriptureGospelCentrality: calculateAverage(
      assessment.worship.scriptureGospelCentrality.subQuestions
    ),
    worshipPreachingSacraments: calculateAverage(
      assessment.worship.worshipPreachingSacraments.subQuestions
    ),
    primacyOfPrayer: calculateAverage(
      assessment.worship.primacyOfPrayer.subQuestions
    ),
    // Section 2: Discipleship
    discipleshipPracticedIntentionally: calculateAverage(
      assessment.discipleship.discipleshipPracticedIntentionally.subQuestions
    ),
    ntPatternsOfChurchLife: calculateAverage(
      assessment.discipleship.ntPatternsOfChurchLife.subQuestions
    ),
    leadershipDevelopment: calculateAverage(
      assessment.discipleship.leadershipDevelopment.subQuestions
    ),
    cultureOfGenerosity: calculateAverage(
      assessment.discipleship.cultureOfGenerosity.subQuestions
    ),
    // Section 3: Mission
    cityCultureEngagement: calculateAverage(
      assessment.mission.cityCultureEngagement.subQuestions
    ),
    evangelismContextualization: calculateAverage(
      assessment.mission.evangelismContextualization.subQuestions
    ),
    churchPlantingPartnerships: calculateAverage(
      assessment.mission.churchPlantingPartnerships.subQuestions
    ),
  };
}

/**
 * Calculate section averages from point scores
 */
export function calculateSectionAverages(
  points: CalculatedScores["points"]
): CalculatedScores["sections"] {
  return {
    worship: calculateAverage([
      points.scriptureGospelCentrality,
      points.worshipPreachingSacraments,
      points.primacyOfPrayer,
    ]),
    discipleship: calculateAverage([
      points.discipleshipPracticedIntentionally,
      points.ntPatternsOfChurchLife,
      points.leadershipDevelopment,
      points.cultureOfGenerosity,
    ]),
    mission: calculateAverage([
      points.cityCultureEngagement,
      points.evangelismContextualization,
      points.churchPlantingPartnerships,
    ]),
  };
}

/**
 * Calculate all scores from assessment response
 */
export function calculateAllScores(
  assessment: AssessmentResponse
): CalculatedScores {
  const points = calculatePointScores(assessment);
  const sections = calculateSectionAverages(points);

  return {
    points,
    sections,
  };
}

/**
 * Get point scores as an array in the correct order for radar chart
 */
export function getPointScoresArray(scores: CalculatedScores): number[] {
  return [
    scores.points.scriptureGospelCentrality,
    scores.points.worshipPreachingSacraments,
    scores.points.primacyOfPrayer,
    scores.points.discipleshipPracticedIntentionally,
    scores.points.ntPatternsOfChurchLife,
    scores.points.leadershipDevelopment,
    scores.points.cultureOfGenerosity,
    scores.points.cityCultureEngagement,
    scores.points.evangelismContextualization,
    scores.points.churchPlantingPartnerships,
  ];
}

