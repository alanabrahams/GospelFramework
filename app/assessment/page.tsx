"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  assessmentResponseSchema,
  type AssessmentResponse,
} from "@/types/assessment-schema";
import StepWizard from "@/components/StepWizard";
import { calculateAllScores } from "@/lib/calculations";
import type { QuestionsData, SubQuestion } from "@/types/questions";

// Step configuration
const STEPS = [
  "Worship - Point 1",
  "Worship - Point 2",
  "Worship - Point 3",
  "Discipleship - Point 4",
  "Discipleship - Point 5",
  "Discipleship - Point 6",
  "Discipleship - Point 7",
  "Mission - Point 8",
  "Mission - Point 9",
  "Mission - Point 10",
];

const POINT_DESCRIPTIONS = [
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
];

// Default number of sub-questions per point (can be customized)
const DEFAULT_SUB_QUESTIONS = 3;

// Mapping from step number to point path
const STEP_TO_POINT_MAP: Array<{
  section: "worship" | "discipleship" | "mission";
  pointId: string;
}> = [
  { section: "worship", pointId: "scriptureGospelCentrality" },
  { section: "worship", pointId: "worshipPreachingSacraments" },
  { section: "worship", pointId: "primacyOfPrayer" },
  { section: "discipleship", pointId: "discipleshipPracticedIntentionally" },
  { section: "discipleship", pointId: "ntPatternsOfChurchLife" },
  { section: "discipleship", pointId: "leadershipDevelopment" },
  { section: "discipleship", pointId: "cultureOfGenerosity" },
  { section: "mission", pointId: "cityCultureEngagement" },
  { section: "mission", pointId: "evangelismContextualization" },
  { section: "mission", pointId: "churchPlantingPartnerships" },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<QuestionsData | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Initialize form with default values
  const getDefaultValues = (questionsData: QuestionsData | null): AssessmentResponse => {
    if (!questionsData) {
      // Fallback to defaults
      return {
        worship: {
          scriptureGospelCentrality: { subQuestions: [3, 3, 3] },
          worshipPreachingSacraments: { subQuestions: [3, 3, 3] },
          primacyOfPrayer: { subQuestions: [3, 3, 3] },
        },
        discipleship: {
          discipleshipPracticedIntentionally: { subQuestions: [3, 3, 3] },
          ntPatternsOfChurchLife: { subQuestions: [3, 3, 3] },
          leadershipDevelopment: { subQuestions: [3, 3, 3] },
          cultureOfGenerosity: { subQuestions: [3, 3, 3] },
        },
        mission: {
          cityCultureEngagement: { subQuestions: [3, 3, 3] },
          evangelismContextualization: { subQuestions: [3, 3, 3] },
          churchPlantingPartnerships: { subQuestions: [3, 3, 3] },
        },
      };
    }

    // Build default values from questions data
    const defaults: AssessmentResponse = {
      worship: {
        scriptureGospelCentrality: {
          subQuestions: questionsData.worship.points[0].subQuestions.map(() => 3),
        },
        worshipPreachingSacraments: {
          subQuestions: questionsData.worship.points[1].subQuestions.map(() => 3),
        },
        primacyOfPrayer: {
          subQuestions: questionsData.worship.points[2].subQuestions.map(() => 3),
        },
      },
      discipleship: {
        discipleshipPracticedIntentionally: {
          subQuestions: questionsData.discipleship.points[0].subQuestions.map(() => 3),
        },
        ntPatternsOfChurchLife: {
          subQuestions: questionsData.discipleship.points[1].subQuestions.map(() => 3),
        },
        leadershipDevelopment: {
          subQuestions: questionsData.discipleship.points[2].subQuestions.map(() => 3),
        },
        cultureOfGenerosity: {
          subQuestions: questionsData.discipleship.points[3].subQuestions.map(() => 3),
        },
      },
      mission: {
        cityCultureEngagement: {
          subQuestions: questionsData.mission.points[0].subQuestions.map(() => 3),
        },
        evangelismContextualization: {
          subQuestions: questionsData.mission.points[1].subQuestions.map(() => 3),
        },
        churchPlantingPartnerships: {
          subQuestions: questionsData.mission.points[2].subQuestions.map(() => 3),
        },
      },
    };

    return defaults;
  };

  const form = useForm<AssessmentResponse>({
    resolver: zodResolver(assessmentResponseSchema),
    defaultValues: getDefaultValues(null),
  });

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/api/questions");
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
          // Update form defaults if questions loaded
          const defaults = getDefaultValues(data);
          form.reset(defaults);
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
        // Continue with defaults
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  // Get current point's field path and values
  const getCurrentFieldPath = () => {
    switch (currentStep) {
      case 1:
        return "worship.scriptureGospelCentrality.subQuestions";
      case 2:
        return "worship.worshipPreachingSacraments.subQuestions";
      case 3:
        return "worship.primacyOfPrayer.subQuestions";
      case 4:
        return "discipleship.discipleshipPracticedIntentionally.subQuestions";
      case 5:
        return "discipleship.ntPatternsOfChurchLife.subQuestions";
      case 6:
        return "discipleship.leadershipDevelopment.subQuestions";
      case 7:
        return "discipleship.cultureOfGenerosity.subQuestions";
      case 8:
        return "mission.cityCultureEngagement.subQuestions";
      case 9:
        return "mission.evangelismContextualization.subQuestions";
      case 10:
        return "mission.churchPlantingPartnerships.subQuestions";
      default:
        return "";
    }
  };

  const handleNext = async () => {
    const fieldPath = getCurrentFieldPath();
    const isValid = await form.trigger(fieldPath as any);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const onSubmit = async (data: AssessmentResponse) => {
    setIsSubmitting(true);
    try {
      // Get user info from sessionStorage
      const userInfoStr = sessionStorage.getItem("userInfo");
      if (!userInfoStr) {
        router.push("/");
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      const scores = calculateAllScores(data);

      // Store complete submission
      const submission = {
        ...userInfo,
        assessment: data,
        scores,
      };

      sessionStorage.setItem("submission", JSON.stringify(submission));

      // Navigate to results
      router.push("/results");
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setIsSubmitting(false);
    }
  };

  const fieldPath = getCurrentFieldPath();
  const currentValues = form.watch(fieldPath as any) as number[] || [3, 3, 3];

  // Get current point info and sub-questions
  const getCurrentPointInfo = () => {
    const stepInfo = STEP_TO_POINT_MAP[currentStep - 1];
    if (!stepInfo || !questions) {
      return {
        title: POINT_DESCRIPTIONS[currentStep - 1] || "",
        description: "",
        subQuestions: [] as SubQuestion[],
      };
    }

    const section = questions[stepInfo.section];
    const point = section.points.find((p) => p.id === stepInfo.pointId);
    
    if (!point) {
      return {
        title: POINT_DESCRIPTIONS[currentStep - 1] || "",
        description: "",
        subQuestions: [] as SubQuestion[],
      };
    }

    return {
      title: point.title,
      description: point.description || "",
      subQuestions: point.subQuestions.sort((a, b) => a.order - b.order),
    };
  };

  const currentPointInfo = getCurrentPointInfo();
  const subQuestions = currentPointInfo.subQuestions.length > 0
    ? currentPointInfo.subQuestions
    : currentValues.map((_, idx) => ({
        id: `default-${idx}`,
        text: `Sub-Question ${idx + 1}`,
        order: idx + 1,
      }));

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center">
        <div className="text-city-blue text-xl">Loading assessment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-sand py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Step Wizard */}
        <StepWizard
          currentStep={currentStep}
          totalSteps={STEPS.length}
          stepLabels={STEPS}
        />

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Current Step Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-city-blue mb-2">
                {currentPointInfo.title}
              </h2>
              {currentPointInfo.description && (
                <p className="text-urban-steel/80 text-sm mb-4">
                  {currentPointInfo.description}
                </p>
              )}
              <p className="text-urban-steel">
                Please rate each sub-question on a scale of 1-5, where:
              </p>
              <ul className="list-disc list-inside text-urban-steel text-sm mt-2 ml-4">
                <li>1 = Strongly Disagree / Not Present</li>
                <li>2 = Disagree / Rarely Present</li>
                <li>3 = Neutral / Sometimes Present</li>
                <li>4 = Agree / Often Present</li>
                <li>5 = Strongly Agree / Consistently Present</li>
              </ul>
            </div>

            {/* Sub-Questions */}
            <div className="space-y-6 mb-8">
              {subQuestions.map((subQuestion, index) => {
                // Ensure we have a value for this index
                const value = currentValues[index] !== undefined ? currentValues[index] : 3;
                
                return (
                  <div key={subQuestion.id} className="border-b border-light-city-gray pb-4">
                    <label className="block text-sm font-medium text-urban-steel mb-3">
                      {subQuestion.text}
                      <span className="text-grace-coral ml-1">*</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-urban-steel w-12">1</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={value}
                        onChange={(e) => {
                          const newValues = [...currentValues];
                          // Ensure array is long enough
                          while (newValues.length <= index) {
                            newValues.push(3);
                          }
                          newValues[index] = parseInt(e.target.value);
                          form.setValue(fieldPath as any, newValues);
                        }}
                        className="flex-1 h-2 bg-light-city-gray rounded-lg appearance-none cursor-pointer accent-city-blue"
                      />
                      <span className="text-sm text-urban-steel w-12 text-right">
                        5
                      </span>
                      <div className="w-16 text-center">
                        <span className="text-lg font-semibold text-city-blue">
                          {value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-light-city-gray">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-urban-steel text-urban-steel rounded-lg font-semibold hover:bg-light-city-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-city-blue text-white rounded-lg font-semibold hover:bg-city-blue/90 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gospel-gold text-white rounded-lg font-semibold hover:bg-gospel-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Calculating..." : "View Results"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

