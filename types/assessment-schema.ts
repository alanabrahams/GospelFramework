import { z } from "zod";

/**
 * THE CORE CONTRACT - Single source of truth for all data flows
 * Gospel-Centered Church Health Framework Assessment Schema
 */

// Score validation: 1-5 scale
const scoreSchema = z.number().min(1).max(5).int();

// User Information Schema
export const userInfoSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  churchName: z.string().min(1, "Church name is required"),
});

export type UserInfo = z.infer<typeof userInfoSchema>;

/**
 * Section 1: Worship
 * Point 1: Scripture & Gospel Centrality
 * Point 2: Worship, Preaching, Sacraments
 * Point 3: Primacy of Prayer
 */
const worshipSectionSchema = z.object({
  // Point 1: Scripture & Gospel Centrality
  scriptureGospelCentrality: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
  // Point 2: Worship, Preaching, Sacraments
  worshipPreachingSacraments: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
  // Point 3: Primacy of Prayer
  primacyOfPrayer: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
});

/**
 * Section 2: Discipleship
 * Point 4: Discipleship Practiced Intentionally
 * Point 5: NT Patterns of Church Life
 * Point 6: Leadership Development
 * Point 7: Culture of Generosity
 */
const discipleshipSectionSchema = z.object({
  // Point 4: Discipleship Practiced Intentionally
  discipleshipPracticedIntentionally: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
  // Point 5: NT Patterns of Church Life
  ntPatternsOfChurchLife: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
  // Point 6: Leadership Development
  leadershipDevelopment: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
  // Point 7: Culture of Generosity
  cultureOfGenerosity: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
});

/**
 * Section 3: Mission
 * Point 8: City Culture Engagement
 * Point 9: Evangelism Contextualization
 * Point 10: Church Planting & Partnerships
 */
const missionSectionSchema = z.object({
  // Point 8: City Culture Engagement
  cityCultureEngagement: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
  // Point 9: Evangelism Contextualization
  evangelismContextualization: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
  // Point 10: Church Planting & Partnerships
  churchPlantingPartnerships: z.object({
    subQuestions: z.array(scoreSchema).min(1, "At least one sub-question response is required"),
  }),
});

/**
 * Complete Assessment Response Schema
 * Combines all three sections
 */
export const assessmentResponseSchema = z.object({
  worship: worshipSectionSchema,
  discipleship: discipleshipSectionSchema,
  mission: missionSectionSchema,
});

export type AssessmentResponse = z.infer<typeof assessmentResponseSchema>;

/**
 * Complete Submission Schema
 * Combines user info with assessment responses
 */
export const submissionSchema = userInfoSchema.merge(
  z.object({
    assessment: assessmentResponseSchema,
  })
);

export type Submission = z.infer<typeof submissionSchema>;

/**
 * Reflection Notes Schema
 * Maps sub-question IDs to user's private journal notes
 */
export const reflectionNotesSchema = z.record(z.string(), z.string());

export type ReflectionNotes = z.infer<typeof reflectionNotesSchema>;

/**
 * Calculated Scores Schema
 * Derived from assessment responses (not user input)
 */
export const calculatedScoresSchema = z.object({
  // Individual point scores (averages of sub-questions)
  points: z.object({
    scriptureGospelCentrality: z.number().min(1).max(5),
    worshipPreachingSacraments: z.number().min(1).max(5),
    primacyOfPrayer: z.number().min(1).max(5),
    discipleshipPracticedIntentionally: z.number().min(1).max(5),
    ntPatternsOfChurchLife: z.number().min(1).max(5),
    leadershipDevelopment: z.number().min(1).max(5),
    cultureOfGenerosity: z.number().min(1).max(5),
    cityCultureEngagement: z.number().min(1).max(5),
    evangelismContextualization: z.number().min(1).max(5),
    churchPlantingPartnerships: z.number().min(1).max(5),
  }),
  // Section averages
  sections: z.object({
    worship: z.number().min(1).max(5),
    discipleship: z.number().min(1).max(5),
    mission: z.number().min(1).max(5),
  }),
});

export type CalculatedScores = z.infer<typeof calculatedScoresSchema>;

/**
 * Point labels for display (in order for radar chart)
 */
export const POINT_LABELS = [
  "Scripture & Gospel Centrality",
  "Worship, Preaching, Sacraments",
  "Primacy of Prayer",
  "Discipleship Practiced Intentionally",
  "NT Patterns of Church Life",
  "Leadership Development",
  "Culture of Generosity",
  "City Culture Engagement",
  "Evangelism Contextualization",
  "Church Planting & Partnerships",
] as const;

/**
 * Section labels
 */
export const SECTION_LABELS = {
  worship: "Worship",
  discipleship: "Discipleship",
  mission: "Mission",
} as const;







