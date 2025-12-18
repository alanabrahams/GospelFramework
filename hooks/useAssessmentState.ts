"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { QuestionsData } from "@/types/questions";
import type { AssessmentResponse } from "@/types/assessment-schema";

const STORAGE_KEY_PREFIX = "rctc_assessment_v1";
const DEBOUNCE_DELAY = 500; // milliseconds

// Get user-specific storage key
const getStorageKey = (): string => {
  if (typeof window === "undefined") return STORAGE_KEY_PREFIX;
  
  try {
    const userInfoStr = sessionStorage.getItem("userInfo");
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      // Use email as part of the key to make it user-specific
      return `${STORAGE_KEY_PREFIX}_${userInfo.email}`;
    }
  } catch (error) {
    console.error("Error getting user info for storage key:", error);
  }
  
  return STORAGE_KEY_PREFIX;
};

export interface AssessmentState {
  answers: Record<string, number>; // { "1.1": 4, "1.2": 2, "2.1": 3 }
  reflections: Record<string, string>; // { "1.1": "My notes...", "2.1": "..." }
  currentSection: number; // 1, 2, or 3
  lastUpdated: number; // Timestamp
}

interface CompletionResult {
  isComplete: boolean;
  percentage: number;
}

/**
 * Custom hook for managing assessment state with auto-save to localStorage
 */
export function useAssessmentState() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Save state to localStorage (debounced)
   */
  const saveToLocalStorage = useCallback((state: AssessmentState) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
      }
    }, DEBOUNCE_DELAY);
  }, []);

  /**
   * Load state from localStorage
   */
  const loadFromLocalStorage = useCallback((): AssessmentState | null => {
    try {
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const parsed = JSON.parse(stored) as AssessmentState;
      
      // Validate structure
      if (
        typeof parsed.answers === "object" &&
        typeof parsed.reflections === "object" &&
        typeof parsed.currentSection === "number" &&
        parsed.currentSection >= 1 &&
        parsed.currentSection <= 3
      ) {
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  }, []);

  /**
   * Rehydrate state from localStorage on mount
   * Only loads if the user matches the stored user
   */
  useEffect(() => {
    // Check if user matches before loading
    try {
      const userInfoStr = typeof window !== "undefined" ? sessionStorage.getItem("userInfo") : null;
      const lastUserEmail = typeof window !== "undefined" ? localStorage.getItem("rctc_last_user_email") : null;
      
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        // Only load if this is the same user
        if (lastUserEmail === userInfo.email) {
          const stored = loadFromLocalStorage();
          if (stored) {
            setAnswers(stored.answers || {});
            setReflections(stored.reflections || {});
            setCurrentSection(stored.currentSection || 1);
          }
        } else {
          // Different user, start fresh
          setAnswers({});
          setReflections({});
          setCurrentSection(1);
          // Store new user email
          localStorage.setItem("rctc_last_user_email", userInfo.email);
        }
      } else {
        // No user info, start fresh
        setAnswers({});
        setReflections({});
        setCurrentSection(1);
      }
    } catch (error) {
      console.error("Error checking user during hydration:", error);
      // On error, start fresh
      setAnswers({});
      setReflections({});
      setCurrentSection(1);
    }
    
    setIsHydrated(true);
  }, [loadFromLocalStorage]);

  /**
   * Auto-save to localStorage whenever state changes
   */
  useEffect(() => {
    if (!isHydrated) return; // Don't save during initial hydration

    const state: AssessmentState = {
      answers,
      reflections,
      currentSection,
      lastUpdated: Date.now(),
    };

    saveToLocalStorage(state);
  }, [answers, reflections, currentSection, isHydrated, saveToLocalStorage]);

  /**
   * Set answer for a specific question ID
   */
  const setAnswer = useCallback((questionId: string, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  }, []);

  /**
   * Set reflection notes for a specific question ID
   */
  const setReflection = useCallback((questionId: string, notes: string) => {
    setReflections((prev) => ({
      ...prev,
      [questionId]: notes,
    }));
  }, []);

  /**
   * Update current section
   */
  const updateCurrentSection = useCallback((section: number) => {
    if (section >= 1 && section <= 3) {
      setCurrentSection(section);
    }
  }, []);

  /**
   * Check if all questions are answered
   */
  const checkCompletion = useCallback(
    (questions: QuestionsData | null): CompletionResult => {
      if (!questions) {
        return { isComplete: false, percentage: 0 };
      }

      // Collect all sub-question IDs from questions.json
      const allQuestionIds: string[] = [];

      // Iterate through all sections
      Object.values(questions).forEach((section) => {
        section.points.forEach((point: any) => {
          point.subQuestions.forEach((subQuestion: any) => {
            allQuestionIds.push(subQuestion.id);
          });
        });
      });

      // Check how many are answered
      const answeredCount = allQuestionIds.filter(
        (id) => answers[id] !== undefined && answers[id] !== null
      ).length;

      const totalCount = allQuestionIds.length;
      const percentage = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;
      const isComplete = answeredCount === totalCount && totalCount > 0;

      return { isComplete, percentage };
    },
    [answers]
  );

  /**
   * Clear all state (useful after submission or user change)
   */
  const clearState = useCallback(() => {
    setAnswers({});
    setReflections({});
    setCurrentSection(1);
    try {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
      // Also clear old non-user-specific key if it exists
      localStorage.removeItem(STORAGE_KEY_PREFIX);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }, []);

  /**
   * Get answer for a specific question ID
   */
  const getAnswer = useCallback(
    (questionId: string): number | undefined => {
      return answers[questionId];
    },
    [answers]
  );

  /**
   * Get reflection for a specific question ID
   */
  const getReflection = useCallback(
    (questionId: string): string | undefined => {
      return reflections[questionId];
    },
    [reflections]
  );

  return {
    answers,
    reflections,
    currentSection,
    isHydrated,
    setAnswer,
    setReflection,
    updateCurrentSection,
    checkCompletion,
    clearState,
    getAnswer,
    getReflection,
  };
}

/**
 * Convert nested form structure to flat answer structure
 * Input: { worship: { scriptureGospelCentrality: { subQuestions: [4, 3, 5] } } }
 * Output: { "1.1": 4, "1.2": 3, "1.3": 5 }
 */
export function flattenAnswers(
  formData: AssessmentResponse,
  questions: QuestionsData
): Record<string, number> {
  const flatAnswers: Record<string, number> = {};

  // Map section names to their data
  const sectionMap = {
    worship: questions.worship,
    discipleship: questions.discipleship,
    mission: questions.mission,
  };

  // Iterate through form data structure
  Object.entries(formData).forEach(([sectionKey, sectionData]) => {
    const section = sectionMap[sectionKey as keyof typeof sectionMap];
    if (!section) return;

    // Iterate through points in this section
    Object.entries(sectionData).forEach(([pointKey, pointData]) => {
      const point = section.points.find((p) => p.id === pointKey);
      if (!point) return;

      // Map sub-questions to their IDs
      point.subQuestions
        .sort((a, b) => a.order - b.order)
        .forEach((subQuestion, index) => {
          const value = pointData.subQuestions[index];
          if (value !== null && value !== undefined) {
            flatAnswers[subQuestion.id] = value;
          }
        });
    });
  });

  return flatAnswers;
}

/**
 * Convert flat answer structure to nested form structure
 * Input: { "1.1": 4, "1.2": 3, "1.3": 5 }
 * Output: { worship: { scriptureGospelCentrality: { subQuestions: [4, 3, 5] } } }
 */
export function unflattenAnswers(
  flatAnswers: Record<string, number>,
  questions: QuestionsData
): AssessmentResponse {
  const formData: AssessmentResponse = {
    worship: {
      scriptureGospelCentrality: { subQuestions: [] },
      worshipPreachingSacraments: { subQuestions: [] },
      primacyOfPrayer: { subQuestions: [] },
    },
    discipleship: {
      discipleshipPracticedIntentionally: { subQuestions: [] },
      ntPatternsOfChurchLife: { subQuestions: [] },
      leadershipDevelopment: { subQuestions: [] },
      cultureOfGenerosity: { subQuestions: [] },
    },
    mission: {
      cityCultureEngagement: { subQuestions: [] },
      evangelismContextualization: { subQuestions: [] },
      churchPlantingPartnerships: { subQuestions: [] },
    },
  };

  // Map section names to their data
  const sectionMap = {
    worship: questions.worship,
    discipleship: questions.discipleship,
    mission: questions.mission,
  };

  // Iterate through all sections and points
  Object.entries(sectionMap).forEach(([sectionKey, section]) => {
    section.points.forEach((point) => {
      const subQuestions = point.subQuestions
        .sort((a, b) => a.order - b.order)
        .map((subQuestion) => {
          const value = flatAnswers[subQuestion.id];
          return value !== undefined && value !== null ? value : (null as any);
        });

      // Set the subQuestions array in the form data
      const sectionData = formData[sectionKey as keyof AssessmentResponse];
      if (sectionData && point.id in sectionData) {
        (sectionData as any)[point.id].subQuestions = subQuestions;
      }
    });
  });

  return formData;
}

