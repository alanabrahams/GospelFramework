"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  assessmentResponseSchema,
  type AssessmentResponse,
} from "@/types/assessment-schema";
import AssessmentProgressBar from "@/components/ui/AssessmentProgressBar";
import { calculateAllScores } from "@/lib/calculations";
import type { QuestionsData, SubQuestion } from "@/types/questions";
import QuestionView from "@/components/ui/QuestionView";
import ReflectionView from "@/components/ui/ReflectionView";
import ReviewAnswers from "@/components/ui/ReviewAnswers";
import { useAssessmentState, flattenAnswers, unflattenAnswers } from "@/hooks/useAssessmentState";
import { saveAssessmentDraft } from "@/app/actions";

// Step type definition
type StepType = 'question' | 'reflection';

interface InterleavedStep {
  type: StepType;
  questionId: string;
  index: number;
}

// Mapping from step number to point path (for backward compatibility with section calculations)
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

/**
 * Generate interleaved steps: [Q1, R1, Q2, R2, Q3, R3, ...]
 * Each question is followed by its reflection step
 */
function generateInterleavedSteps(questions: QuestionsData | null): InterleavedStep[] {
  if (!questions) return [];
  
  const steps: InterleavedStep[] = [];
  let stepIndex = 0;
  
  // Iterate through all sections and points
  const sections = [questions.worship, questions.discipleship, questions.mission];
  
  sections.forEach((section) => {
    section.points.forEach((point) => {
      // Sort sub-questions by order
      const sortedSubQuestions = [...point.subQuestions].sort((a, b) => a.order - b.order);
      
      sortedSubQuestions.forEach((subQuestion) => {
        // Add question step
        steps.push({
          type: 'question',
          questionId: subQuestion.id,
          index: stepIndex++,
        });
        
        // Add reflection step (only if reflection_text exists)
        if (subQuestion.reflection_text) {
          steps.push({
            type: 'reflection',
            questionId: subQuestion.id,
            index: stepIndex++,
          });
        }
      });
    });
  });
  
  return steps;
}

// Helper function to get section from question ID
function getSectionFromQuestionId(questionId: string, questions: QuestionsData | null): number {
  if (!questions) return 1;
  
  // Extract the point number from question ID (e.g., "1.1" -> point 1, "4.2" -> point 4)
  const pointNumber = parseInt(questionId.split('.')[0]);
  
  if (pointNumber <= 3) return 1; // Worship
  if (pointNumber <= 7) return 2; // Discipleship
  return 3; // Mission
}

// Helper function to get the first question index for a section
function getFirstQuestionIndexForSection(section: number, steps: InterleavedStep[], questions: QuestionsData | null): number {
  if (!questions) return 0;
  
  const sections = [questions.worship, questions.discipleship, questions.mission];
  const sectionData = sections[section - 1];
  if (!sectionData) return 0;
  
  // Find the first question ID in this section
  const firstPoint = sectionData.points[0];
  if (!firstPoint || firstPoint.subQuestions.length === 0) return 0;
  
  const firstQuestionId = firstPoint.subQuestions.sort((a, b) => a.order - b.order)[0].id;
  const firstStepIndex = steps.findIndex(step => step.questionId === firstQuestionId && step.type === 'question');
  return firstStepIndex >= 0 ? firstStepIndex : 0;
}

// Helper function to calculate progress within a section
function getProgressInSection(currentStepIndex: number, section: number, steps: InterleavedStep[], questions: QuestionsData | null): number {
  if (!questions || steps.length === 0) return 0;
  
  const sections = [questions.worship, questions.discipleship, questions.mission];
  const sectionData = sections[section - 1];
  if (!sectionData) return 0;
  
  // Count total question steps in this section
  const sectionQuestionIds = new Set<string>();
  sectionData.points.forEach(point => {
    point.subQuestions.forEach(subQ => sectionQuestionIds.add(subQ.id));
  });
  
  const sectionSteps = steps.filter(step => 
    step.type === 'question' && sectionQuestionIds.has(step.questionId)
  );
  
  if (sectionSteps.length === 0) return 0;
  
  // Find how many question steps in this section have been completed (before current step)
  const currentStep = steps[currentStepIndex];
  if (!currentStep) return 0;
  
  const completedSteps = sectionSteps.filter(step => step.index < currentStepIndex);
  return (completedSteps.length / sectionSteps.length) * 100;
}

// Check if a section is completed based on actual answers
const getCompletedSections = (
  questions: QuestionsData | null,
  answers: Record<string, number>
): number[] => {
  const completed: number[] = [];
  if (!questions) return completed;

  // Section 1: Worship (steps 1-3, questions 1.1-3.3)
  const worshipQuestionIds = [
    ...questions.worship.points[0].subQuestions.map((q) => q.id),
    ...questions.worship.points[1].subQuestions.map((q) => q.id),
    ...questions.worship.points[2].subQuestions.map((q) => q.id),
  ];
  const worshipAllAnswered = worshipQuestionIds.every(
    (id) => answers[id] !== undefined && answers[id] !== null
  );
  if (worshipAllAnswered && worshipQuestionIds.length > 0) {
    completed.push(1);
  }

  // Section 2: Discipleship (steps 4-7, questions 4.1-7.3)
  const discipleshipQuestionIds = [
    ...questions.discipleship.points[0].subQuestions.map((q) => q.id),
    ...questions.discipleship.points[1].subQuestions.map((q) => q.id),
    ...questions.discipleship.points[2].subQuestions.map((q) => q.id),
    ...questions.discipleship.points[3].subQuestions.map((q) => q.id),
  ];
  const discipleshipAllAnswered = discipleshipQuestionIds.every(
    (id) => answers[id] !== undefined && answers[id] !== null
  );
  if (discipleshipAllAnswered && discipleshipQuestionIds.length > 0) {
    completed.push(2);
  }

  // Section 3: Mission (steps 8-10, questions 8.1-10.3)
  const missionQuestionIds = [
    ...questions.mission.points[0].subQuestions.map((q) => q.id),
    ...questions.mission.points[1].subQuestions.map((q) => q.id),
    ...questions.mission.points[2].subQuestions.map((q) => q.id),
  ];
  const missionAllAnswered = missionQuestionIds.every(
    (id) => answers[id] !== undefined && answers[id] !== null
  );
  if (missionAllAnswered && missionQuestionIds.length > 0) {
    completed.push(3);
  }

  return completed;
};

export default function AssessmentPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<QuestionsData | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [interleavedSteps, setInterleavedSteps] = useState<InterleavedStep[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  
  // Initialize assessment state hook
  const {
    answers: hookAnswers,
    reflections,
    currentSection,
    isHydrated,
    setAnswer,
    setReflection,
    updateCurrentSection,
    checkCompletion,
    clearState,
  } = useAssessmentState();
  
  // Track if we're syncing to avoid infinite loops
  const isSyncingRef = useRef(false);
  const dbSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasRehydratedRef = useRef(false);

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

    // Build default values from questions data (null means not answered yet)
    const defaults: AssessmentResponse = {
      worship: {
        scriptureGospelCentrality: {
          subQuestions: questionsData.worship.points[0].subQuestions.map(() => null as any),
        },
        worshipPreachingSacraments: {
          subQuestions: questionsData.worship.points[1].subQuestions.map(() => null as any),
        },
        primacyOfPrayer: {
          subQuestions: questionsData.worship.points[2].subQuestions.map(() => null as any),
        },
      },
      discipleship: {
        discipleshipPracticedIntentionally: {
          subQuestions: questionsData.discipleship.points[0].subQuestions.map(() => null as any),
        },
        ntPatternsOfChurchLife: {
          subQuestions: questionsData.discipleship.points[1].subQuestions.map(() => null as any),
        },
        leadershipDevelopment: {
          subQuestions: questionsData.discipleship.points[2].subQuestions.map(() => null as any),
        },
        cultureOfGenerosity: {
          subQuestions: questionsData.discipleship.points[3].subQuestions.map(() => null as any),
        },
      },
      mission: {
        cityCultureEngagement: {
          subQuestions: questionsData.mission.points[0].subQuestions.map(() => null as any),
        },
        evangelismContextualization: {
          subQuestions: questionsData.mission.points[1].subQuestions.map(() => null as any),
        },
        churchPlantingPartnerships: {
          subQuestions: questionsData.mission.points[2].subQuestions.map(() => null as any),
        },
      },
    };

    return defaults;
  };

  const form = useForm<AssessmentResponse>({
    resolver: zodResolver(assessmentResponseSchema),
    defaultValues: getDefaultValues(null),
  });

  // Clear state when user changes (check userInfo from sessionStorage)
  useEffect(() => {
    const userInfoStr = sessionStorage.getItem("userInfo");
    if (!userInfoStr) {
      // No user info, clear state
      clearState();
      return;
    }

    try {
      const userInfo = JSON.parse(userInfoStr);
      const lastUserEmail = localStorage.getItem("rctc_last_user_email");
      
      // If this is a different user, clear the assessment state
      if (lastUserEmail && lastUserEmail !== userInfo.email) {
        clearState();
      }
      
      // Store current user email
      localStorage.setItem("rctc_last_user_email", userInfo.email);
    } catch (error) {
      console.error("Error checking user info:", error);
      clearState();
    }
  }, [clearState]);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/api/questions");
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
          
          // Generate interleaved steps
          const steps = generateInterleavedSteps(data);
          setInterleavedSteps(steps);
          
          // Initialize form with defaults
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

  // Sync hook state to form when both are ready (rehydration)
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/assessment/page.tsx:348',message:'Rehydration useEffect triggered',data:{isHydrated,hasQuestions:!!questions,isSyncing:isSyncingRef.current,answersCount:Object.keys(hookAnswers).length,stepsCount:interleavedSteps.length,currentStepIndex,hasRehydrated:hasRehydratedRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!isHydrated || !questions || isSyncingRef.current || interleavedSteps.length === 0) return;
    
    // Only sync form data on every hookAnswers change (for form submission)
    // But only restore step index during initial rehydration
    isSyncingRef.current = true;
    try {
      // Convert hook's flat answers to nested form structure
      const formData = unflattenAnswers(hookAnswers, questions);
      form.reset(formData);
      
      // Only restore to first unanswered question step during INITIAL rehydration
      // This prevents auto-advancing when user answers questions
      if (!hasRehydratedRef.current && Object.keys(hookAnswers).length > 0) {
        // Restore to first unanswered question step, or first step if all answered
        const firstUnansweredIndex = interleavedSteps.findIndex(step => 
          step.type === 'question' && !hookAnswers[step.questionId]
        );
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/assessment/page.tsx:367',message:'Rehydration setting step index (initial only)',data:{firstUnansweredIndex,currentStepIndex,willChange:firstUnansweredIndex >= 0 && firstUnansweredIndex !== currentStepIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (firstUnansweredIndex >= 0) {
          setCurrentStepIndex(firstUnansweredIndex);
        } else {
          setCurrentStepIndex(0);
        }
        hasRehydratedRef.current = true;
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [isHydrated, questions, hookAnswers, interleavedSteps]);

  // Get current step
  const currentStep = interleavedSteps[currentStepIndex];
  
  // Get current question data (works for both question and reflection steps since they share questionId)
  const getCurrentQuestion = (): SubQuestion | null => {
    if (!currentStep || !questions) return null;
    
    // Find the question in questions data (works for both question and reflection steps)
    const sections = [questions.worship, questions.discipleship, questions.mission];
    for (const section of sections) {
      for (const point of section.points) {
        const subQuestion = point.subQuestions.find(q => q.id === currentStep.questionId);
        if (subQuestion) return subQuestion;
      }
    }
    return null;
  };

  const handleNext = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/assessment/page.tsx:389',message:'handleNext called',data:{currentStepIndex,stackTrace:new Error().stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (currentStepIndex >= interleavedSteps.length - 1) return;
    
    const nextIndex = currentStepIndex + 1;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/assessment/page.tsx:393',message:'Setting currentStepIndex',data:{from:currentStepIndex,to:nextIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    setCurrentStepIndex(nextIndex);
    
    // Update section in hook if we've moved to a new section
    const nextStep = interleavedSteps[nextIndex];
    if (nextStep && questions) {
      const nextSection = getSectionFromQuestionId(nextStep.questionId, questions);
      if (nextSection !== currentSection) {
        updateCurrentSection(nextSection);
      }
    }
    
    window.scrollTo(0, 0);
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      
      // Update section in hook if we've moved to a new section
      const prevStep = interleavedSteps[prevIndex];
      if (prevStep && questions) {
        const prevSection = getSectionFromQuestionId(prevStep.questionId, questions);
        if (prevSection !== currentSection) {
          updateCurrentSection(prevSection);
        }
      }
      
      window.scrollTo(0, 0);
    }
  };
  
  // Track the current question's answer locally for immediate UI updates
  const [currentQuestionAnswer, setCurrentQuestionAnswer] = useState<number | null>(null);

  // Sync local answer with hook answers when step changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/assessment/page.tsx:429',message:'useEffect sync answer triggered',data:{currentStepIndex,currentStepType:currentStep?.type,questionId:currentStep?.questionId,hookAnswer:hookAnswers[currentStep?.questionId || '']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (currentStep && currentStep.type === 'question') {
      const answer = hookAnswers[currentStep.questionId];
      setCurrentQuestionAnswer(answer !== undefined && answer !== null ? answer : null);
    } else {
      setCurrentQuestionAnswer(null);
    }
  }, [currentStep, hookAnswers]);

  // Check if current step is complete
  const isCurrentStepComplete = (): boolean => {
    if (!currentStep) return false;
    
    if (currentStep.type === 'question') {
      // Check both local state (for immediate updates) and hook state (for persistence)
      const hasAnswer = currentQuestionAnswer !== null || 
        (hookAnswers[currentStep.questionId] !== undefined && hookAnswers[currentStep.questionId] !== null);
      return hasAnswer;
    } else {
      // Reflection is always "complete" (optional)
      return true;
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
      
      // Ensure we're using the latest data from hook (in case form is out of sync)
      const latestFormData = questions 
        ? unflattenAnswers(hookAnswers, questions)
        : data;
      
      const scores = calculateAllScores(latestFormData);

      // Store complete submission
      const submission = {
        ...userInfo,
        assessment: latestFormData,
        scores,
        reflectionNotes: reflections,
      };

      sessionStorage.setItem("submission", JSON.stringify(submission));

      // Clear saved state after successful submission
      clearState();

      // Navigate to results
      router.push("/results");
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setIsSubmitting(false);
    }
  };
  
  // Handle section navigation (only allow current or completed sections)
  const handleSectionChange = (section: number) => {
    if (section < 1 || section > 3 || !questions || interleavedSteps.length === 0) return;
    
    // Only allow navigation to current section or completed sections
    const completedSections = getCompletedSections(questions, hookAnswers);
    const isCurrentSection = displaySection === section;
    const isCompletedSection = completedSections.includes(section);
    
    if (!isCurrentSection && !isCompletedSection) {
      // Section is locked, don't allow navigation
      return;
    }
    
    updateCurrentSection(section);
    
    // Find first question step in the selected section
    const firstIndex = getFirstQuestionIndexForSection(section, interleavedSteps, questions);
    setCurrentStepIndex(firstIndex);
    window.scrollTo(0, 0);
  };

  // Save draft to database (debounced, every 30 seconds or on section change)
  useEffect(() => {
    if (!isHydrated || !questions || Object.keys(hookAnswers).length === 0) return;
    
    // Clear existing timer
    if (dbSaveTimerRef.current) {
      clearTimeout(dbSaveTimerRef.current);
    }
    
    // Debounce database save (30 seconds)
    dbSaveTimerRef.current = setTimeout(async () => {
      try {
        // Get user info from sessionStorage
        const userInfoStr = sessionStorage.getItem("userInfo");
        if (!userInfoStr) {
          // No user info, skip database save
          return;
        }
        
        const userInfo = JSON.parse(userInfoStr);
        
        // Convert hook answers to form structure
        const formData = unflattenAnswers(hookAnswers, questions);
        
        // Save draft
        await saveAssessmentDraft({
          email: userInfo.email,
          name: userInfo.name,
          churchName: userInfo.churchName,
          assessment: formData,
          reflectionNotes: reflections,
        });
      } catch (error) {
        console.error("Error saving draft to database:", error);
        // Fail silently - localStorage is the primary backup
      }
    }, 30000); // 30 seconds
    
    return () => {
      if (dbSaveTimerRef.current) {
        clearTimeout(dbSaveTimerRef.current);
      }
    };
  }, [hookAnswers, reflections, currentSection, isHydrated, questions]);

  // Save draft immediately on section change
  useEffect(() => {
    if (!isHydrated || !questions || Object.keys(hookAnswers).length === 0) return;
    
    const saveDraftOnSectionChange = async () => {
      try {
        const userInfoStr = sessionStorage.getItem("userInfo");
        if (!userInfoStr) return;
        
        const userInfo = JSON.parse(userInfoStr);
        const formData = unflattenAnswers(hookAnswers, questions);
        
        await saveAssessmentDraft({
          email: userInfo.email,
          name: userInfo.name,
          churchName: userInfo.churchName,
          assessment: formData,
          reflectionNotes: reflections,
        });
      } catch (error) {
        console.error("Error saving draft on section change:", error);
      }
    };
    
    // Debounce section change saves (2 seconds)
    const timer = setTimeout(saveDraftOnSectionChange, 2000);
    return () => clearTimeout(timer);
  }, [currentSection]);

  // Get current question and reflection data
  const currentQuestion = getCurrentQuestion();
  
  // Get reflection text for current step (cleaned of common reflection prefixes)
  const getCurrentReflectionText = (): string => {
    if (!currentStep || currentStep.type !== 'reflection' || !currentQuestion) return '';
    let text = currentQuestion.reflection_text || '';
    
    // Remove common reflection prefixes/phrases
    const prefixesToRemove = [
      /^Take a moment to reflect:\s*/i,
      /^Reflect:\s*/i,
      /^Let's reflect:\s*/i,
      /^Reflection:\s*/i,
      /^Consider:\s*/i,
      /^Think about:\s*/i,
      /^Take a moment:\s*/i,
    ];
    
    // Remove each prefix pattern
    prefixesToRemove.forEach(pattern => {
      text = text.replace(pattern, '');
    });
    
    // Trim any extra whitespace
    text = text.trim();
    
    return text;
  };

  if (isLoadingQuestions || interleavedSteps.length === 0) {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center">
        <div className="text-city-blue text-xl">Loading assessment...</div>
      </div>
    );
  }

  // Calculate section progress values
  const displaySection = currentStep && questions 
    ? getSectionFromQuestionId(currentStep.questionId, questions)
    : currentSection;
  const completedSections = getCompletedSections(questions, hookAnswers);
  const progressInCurrent = getProgressInSection(currentStepIndex, displaySection, interleavedSteps, questions);
  
  // Get completion status for submit button
  const completionStatus = checkCompletion(questions);
  const isFullyComplete = completionStatus.isComplete;
  
  // Check if we're on the last step
  const isLastStep = currentStepIndex >= interleavedSteps.length - 1;

  // Navigate to a specific question
  const handleNavigateToQuestion = (questionId: string) => {
    const stepIndex = interleavedSteps.findIndex(
      (step) => step.questionId === questionId && step.type === 'question'
    );
    if (stepIndex >= 0) {
      setCurrentStepIndex(stepIndex);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-warm-sand py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Assessment Progress Bar */}
        <AssessmentProgressBar
          currentSection={displaySection}
          completedSections={completedSections}
          progressInCurrent={progressInCurrent}
          onSectionClick={handleSectionChange}
        />

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className="text-sm text-urban-steel/70 font-medium">
            {completionStatus.percentage > 0 && (
              <span>{Math.round(completionStatus.percentage)}% Complete</span>
            )}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg px-8 pt-6 pb-8 min-h-[500px]">
          <form onSubmit={(e) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/assessment/page.tsx:686',message:'Form onSubmit triggered',data:{currentStepIndex,type:e.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            e.preventDefault();
            form.handleSubmit(onSubmit)(e);
          }}>
            {currentStep && currentStep.type === 'question' && currentQuestion ? (
              <QuestionView
                question={currentQuestion}
                selectedScore={currentQuestionAnswer !== null ? currentQuestionAnswer : (hookAnswers[currentStep.questionId] || null)}
                onSelect={(score) => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/assessment/page.tsx:693',message:'onSelect called',data:{score,questionId:currentStep.questionId,currentStepIndex,stackTrace:new Error().stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                  // #endregion
                  if (isSyncingRef.current) return;
                  
                  isSyncingRef.current = true;
                  try {
                    // Update local state immediately for UI responsiveness
                    setCurrentQuestionAnswer(score);
                    
                    // Update hook state
                    setAnswer(currentStep.questionId, score);
                    
                    // Update form (for submission)
                    const formData = unflattenAnswers(
                      { ...hookAnswers, [currentStep.questionId]: score },
                      questions!
                    );
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/assessment/page.tsx:709',message:'Calling form.reset',data:{questionId:currentStep.questionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                    // #endregion
                    form.reset(formData);
                  } finally {
                    isSyncingRef.current = false;
                  }
                }}
              />
            ) : currentStep && currentStep.type === 'reflection' && currentQuestion ? (
              <ReflectionView
                reflectionText={getCurrentReflectionText()}
                notes={reflections[currentStep.questionId] || ""}
                onNotesChange={(notes) => {
                  setReflection(currentStep.questionId, notes);
                }}
              />
            ) : (
              <div className="text-urban-steel">Loading...</div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-light-city-gray">
              {/* Back Button */}
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-urban-steel hover:text-city-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium">Back</span>
              </button>

              {/* Continue/Submit Button */}
              <div className="flex-1 flex justify-end">
                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isCurrentStepComplete()}
                    className="px-6 py-2 bg-city-blue text-white rounded-lg font-semibold hover:bg-city-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      type="submit"
                      disabled={isSubmitting || !isFullyComplete}
                      className="px-6 py-2 bg-city-blue text-white rounded-lg font-semibold hover:bg-city-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!isFullyComplete ? "Complete all sections to view results" : ""}
                    >
                      {isSubmitting ? "Calculating..." : "View Results"}
                    </button>
                    {!isFullyComplete && (
                      <div className="absolute -bottom-6 left-0 right-0 text-xs text-urban-steel/70 text-center">
                        Complete all sections to view results
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Review Answers Button - Moved to bottom */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setIsReviewOpen(true)}
            className="rounded-lg border border-urban-steel/30 bg-white px-4 py-2 text-sm font-medium text-urban-steel hover:bg-light-city-gray transition-colors"
          >
            Review Answers
          </button>
        </div>
      </div>
      
      {/* Review Answers Modal */}
      <ReviewAnswers
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        questions={questions}
        answers={hookAnswers}
        reflections={reflections}
        currentQuestionId={currentStep?.questionId || null}
        onNavigateToQuestion={handleNavigateToQuestion}
      />
    </div>
  );
}

