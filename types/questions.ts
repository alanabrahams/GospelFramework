/**
 * Question structure types for the admin editor and assessment display
 */

export interface SubQuestion {
  id: string;
  text: string;
  order: number;
}

export interface Point {
  id: string;
  title: string;
  description?: string;
  subQuestions: SubQuestion[];
}

export interface Section {
  id: string;
  title: string;
  points: Point[];
}

export interface QuestionsData {
  worship: Section;
  discipleship: Section;
  mission: Section;
}

/**
 * Helper type for point IDs matching the assessment schema
 */
export type PointId =
  | "scriptureGospelCentrality"
  | "worshipPreachingSacraments"
  | "primacyOfPrayer"
  | "discipleshipPracticedIntentionally"
  | "ntPatternsOfChurchLife"
  | "leadershipDevelopment"
  | "cultureOfGenerosity"
  | "cityCultureEngagement"
  | "evangelismContextualization"
  | "churchPlantingPartnerships";

/**
 * Helper type for section IDs
 */
export type SectionId = "worship" | "discipleship" | "mission";

