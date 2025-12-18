"use server";

import { createClient } from "@/lib/supabase/server";
import { submissionSchema, calculatedScoresSchema, type CalculatedScores } from "@/types/assessment-schema";
import { calculateAllScores } from "@/lib/calculations";
import { getPointScoresArray } from "@/lib/calculations";

type AssessmentData = {
  name: string;
  email: string;
  churchName: string;
  assessment: any;
  scores: CalculatedScores;
  reflectionNotes?: any;
};

/**
 * Submit an assessment to Supabase
 */
export async function submitAssessment(data: AssessmentData) {
  try {
    // Validate the submission data
    const validatedSubmission = submissionSchema.parse({
      name: data.name,
      email: data.email,
      churchName: data.churchName,
      assessment: data.assessment,
    });

    // Validate scores
    const validatedScores = calculatedScoresSchema.parse(data.scores);

    // Calculate total score (average of all 10 point scores)
    const pointScoresArray = getPointScoresArray(validatedScores);
    const totalScore = pointScoresArray.reduce((sum, score) => sum + score, 0) / pointScoresArray.length;

    // Prepare scores_json (raw scores for all 10 points)
    const scoresJson = {
      scriptureGospelCentrality: validatedScores.points.scriptureGospelCentrality,
      worshipPreachingSacraments: validatedScores.points.worshipPreachingSacraments,
      primacyOfPrayer: validatedScores.points.primacyOfPrayer,
      discipleshipPracticedIntentionally: validatedScores.points.discipleshipPracticedIntentionally,
      ntPatternsOfChurchLife: validatedScores.points.ntPatternsOfChurchLife,
      leadershipDevelopment: validatedScores.points.leadershipDevelopment,
      cultureOfGenerosity: validatedScores.points.cultureOfGenerosity,
      cityCultureEngagement: validatedScores.points.cityCultureEngagement,
      evangelismContextualization: validatedScores.points.evangelismContextualization,
      churchPlantingPartnerships: validatedScores.points.churchPlantingPartnerships,
    };

    // Prepare section_scores
    const sectionScores = {
      worship: validatedScores.sections.worship,
      discipleship: validatedScores.sections.discipleship,
      mission: validatedScores.sections.mission,
    };

    // Prepare reflection_notes (optional)
    const reflectionNotes = data.reflectionNotes || null;

    // Insert into Supabase
    const supabase = await createClient();
    const { error } = await supabase.from("assessments").insert({
      user_name: validatedSubmission.name,
      user_email: validatedSubmission.email,
      church_name: validatedSubmission.churchName,
      total_score: totalScore,
      scores_json: scoresJson,
      section_scores: sectionScores,
      reflection_notes: reflectionNotes,
    });

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting assessment:", error);
    return {
      success: false,
      error: error.message || "Failed to submit assessment",
    };
  }
}

/**
 * Fetch all assessments from Supabase
 */
export async function fetchAssessments() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
  } catch (error: any) {
    console.error("Error fetching assessments:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch assessments",
      data: null,
    };
  }
}

/**
 * Save assessment draft to Supabase
 * Uses upsert to update existing draft or create new one
 */
export async function saveAssessmentDraft(data: {
  email: string;
  name?: string;
  churchName?: string;
  assessment?: any;
  reflectionNotes?: any;
}) {
  try {
    const supabase = await createClient();
    
    // Calculate scores if assessment data is provided
    let scoresJson = null;
    let sectionScores = null;
    let totalScore = null;
    
    if (data.assessment) {
      try {
        const scores = calculateAllScores(data.assessment);
        const validatedScores = calculatedScoresSchema.parse(scores);
        
        const pointScoresArray = getPointScoresArray(validatedScores);
        totalScore = pointScoresArray.reduce((sum, score) => sum + score, 0) / pointScoresArray.length;
        
        scoresJson = {
          scriptureGospelCentrality: validatedScores.points.scriptureGospelCentrality,
          worshipPreachingSacraments: validatedScores.points.worshipPreachingSacraments,
          primacyOfPrayer: validatedScores.points.primacyOfPrayer,
          discipleshipPracticedIntentionally: validatedScores.points.discipleshipPracticedIntentionally,
          ntPatternsOfChurchLife: validatedScores.points.ntPatternsOfChurchLife,
          leadershipDevelopment: validatedScores.points.leadershipDevelopment,
          cultureOfGenerosity: validatedScores.points.cultureOfGenerosity,
          cityCultureEngagement: validatedScores.points.cityCultureEngagement,
          evangelismContextualization: validatedScores.points.evangelismContextualization,
          churchPlantingPartnerships: validatedScores.points.churchPlantingPartnerships,
        };
        
        sectionScores = {
          worship: validatedScores.sections.worship,
          discipleship: validatedScores.sections.discipleship,
          mission: validatedScores.sections.mission,
        };
      } catch (error) {
        // If assessment is incomplete, that's okay for a draft
        console.log("Assessment incomplete, saving as draft without scores");
      }
    }
    
    // Prepare draft data
    const draftData: any = {
      user_email: data.email,
      status: "draft",
      reflection_notes: data.reflectionNotes || null,
    };
    
    // Add optional fields if provided
    if (data.name) draftData.user_name = data.name;
    if (data.churchName) draftData.church_name = data.churchName;
    if (scoresJson) draftData.scores_json = scoresJson;
    if (sectionScores) draftData.section_scores = sectionScores;
    if (totalScore !== null) draftData.total_score = totalScore;
    
    // Upsert using user_email as unique identifier
    // First, try to find existing draft
    const { data: existingDraft } = await supabase
      .from("assessments")
      .select("id")
      .eq("user_email", data.email)
      .eq("status", "draft")
      .single();
    
    if (existingDraft) {
      // Update existing draft
      const { error } = await supabase
        .from("assessments")
        .update(draftData)
        .eq("id", existingDraft.id);
      
      if (error) {
        console.error("Supabase error updating draft:", error);
        return { success: false, error: error.message };
      }
    } else {
      // Insert new draft
      const { error } = await supabase
        .from("assessments")
        .insert(draftData);
      
      if (error) {
        console.error("Supabase error inserting draft:", error);
        return { success: false, error: error.message };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error saving assessment draft:", error);
    return {
      success: false,
      error: error.message || "Failed to save assessment draft",
    };
  }
}

/**
 * Generate dummy data for testing
 */
export async function generateDummyData() {
  try {
    const supabase = await createClient();

    // Church names for dummy data
    const churchNames = [
      "Redeemer City",
      "Grace Hill",
      "Hope Metro",
      "Faith Community",
      "Gospel Light",
      "City Church",
      "Redeemer Heights",
      "Grace Point",
      "Hope Springs",
      "Faith Fellowship",
    ];

    // Generate 8 dummy assessments
    const dummyAssessments = Array.from({ length: 8 }, (_, i) => {
      // Generate random scores between 2.5 and 5.0 for each point
      const generatePointScore = () => {
        return Math.round((Math.random() * 2.5 + 2.5) * 100) / 100;
      };

      const points = {
        scriptureGospelCentrality: generatePointScore(),
        worshipPreachingSacraments: generatePointScore(),
        primacyOfPrayer: generatePointScore(),
        discipleshipPracticedIntentionally: generatePointScore(),
        ntPatternsOfChurchLife: generatePointScore(),
        leadershipDevelopment: generatePointScore(),
        cultureOfGenerosity: generatePointScore(),
        cityCultureEngagement: generatePointScore(),
        evangelismContextualization: generatePointScore(),
        churchPlantingPartnerships: generatePointScore(),
      };

      // Calculate section averages
      const worship = (points.scriptureGospelCentrality + points.worshipPreachingSacraments + points.primacyOfPrayer) / 3;
      const discipleship = (points.discipleshipPracticedIntentionally + points.ntPatternsOfChurchLife + points.leadershipDevelopment + points.cultureOfGenerosity) / 4;
      const mission = (points.cityCultureEngagement + points.evangelismContextualization + points.churchPlantingPartnerships) / 3;

      const sectionScores = {
        worship: Math.round(worship * 100) / 100,
        discipleship: Math.round(discipleship * 100) / 100,
        mission: Math.round(mission * 100) / 100,
      };

      // Calculate total score
      const pointScoresArray = Object.values(points);
      const totalScore = pointScoresArray.reduce((sum, score) => sum + score, 0) / pointScoresArray.length;

      return {
        user_name: `Test User ${i + 1}`,
        user_email: `testuser${i + 1}@example.com`,
        church_name: churchNames[i % churchNames.length],
        total_score: Math.round(totalScore * 100) / 100,
        scores_json: points,
        section_scores: sectionScores,
      };
    });

    // Insert all dummy assessments
    const { error } = await supabase.from("assessments").insert(dummyAssessments);

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: dummyAssessments.length };
  } catch (error: any) {
    console.error("Error generating dummy data:", error);
    return {
      success: false,
      error: error.message || "Failed to generate dummy data",
    };
  }
}






