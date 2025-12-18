"use client";

import { X } from "lucide-react";
import type { QuestionsData, SubQuestion } from "@/types/questions";

interface DetailedAnswersModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: {
    scores_json: any;
    reflection_notes?: any;
  };
  questions: QuestionsData | null;
}

export default function DetailedAnswersModal({
  isOpen,
  onClose,
  assessment,
  questions,
}: DetailedAnswersModalProps) {
  if (!isOpen || !questions) return null;

  // Helper to get option label from score
  const getOptionLabel = (subQuestion: SubQuestion, score: number): string => {
    if ('options' in subQuestion && subQuestion.options) {
      const option = subQuestion.options.find((opt) => opt.score === score);
      return option ? option.label : `Score ${score}`;
    }
    return `Score ${score}`;
  };

  // Helper to get option description from score
  const getOptionDescription = (subQuestion: SubQuestion, score: number): string => {
    if ('options' in subQuestion && subQuestion.options) {
      const option = subQuestion.options.find((opt) => opt.score === score);
      return option ? option.description : "";
    }
    return "";
  };

  // Reconstruct answers from scores_json
  // Note: scores_json contains point-level averages, not individual sub-question answers
  // We'll show the point scores and indicate which questions were answered
  const getAnswersForPoint = (pointId: string, section: any) => {
    const point = section.points.find((p: any) => p.id === pointId);
    if (!point) return [];
    
    const pointScore = assessment.scores_json[pointId];
    if (!pointScore) return [];
    
    // We don't have individual sub-question scores, so we'll show the point average
    // and indicate all sub-questions were answered
    return point.subQuestions.map((sq: SubQuestion) => ({
      subQuestion: sq,
      score: null, // We don't have individual scores
      pointScore: pointScore,
    }));
  };

  // Map point IDs to their sections
  const pointIdToSection: Record<string, { section: any; pointId: string }> = {};
  if (questions) {
    Object.values(questions).forEach((section) => {
      section.points.forEach((point) => {
        pointIdToSection[point.id] = { section, pointId: point.id };
      });
    });
  }

  const reflectionNotes = assessment.reflection_notes || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-light-city-gray px-6 py-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-city-blue">Detailed Answers & Reflections</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-urban-steel hover:bg-light-city-gray transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-6 py-4 flex-1">
            <div className="space-y-8">
              {/* Iterate through all sections */}
              {questions && Object.entries(questions).map(([sectionKey, section]) => (
                <div key={sectionKey} className="space-y-6">
                  <h3 className="text-xl font-bold text-city-blue border-b-2 border-city-blue pb-2">
                    {section.title}
                  </h3>
                  
                  {/* Iterate through points in this section */}
                  {section.points.map((point) => {
                    const pointScore = assessment.scores_json[point.id];
                    if (!pointScore) return null;
                    
                    return (
                      <div key={point.id} className="bg-warm-sand/30 rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-urban-steel">
                            {point.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-urban-steel">Point Score:</span>
                            <span className="text-2xl font-bold text-city-blue">
                              {pointScore.toFixed(2)}
                            </span>
                            <span className="text-sm text-urban-steel">/ 5.0</span>
                          </div>
                        </div>

                        {/* Sub-Questions */}
                        <div className="space-y-4">
                          {point.subQuestions
                            .sort((a, b) => a.order - b.order)
                            .map((subQuestion) => {
                              const reflectionNote = reflectionNotes[subQuestion.id];
                              
                              return (
                                <div
                                  key={subQuestion.id}
                                  className="bg-white rounded-lg p-4 border border-light-city-gray"
                                >
                                  {/* Question Text */}
                                  <div className="mb-3">
                                    <p className="font-medium text-urban-steel">
                                      {subQuestion.text}
                                    </p>
                                  </div>

                                  {/* Answer (if we had individual scores, we'd show them here) */}
                                  <div className="mb-3 p-3 bg-city-blue/5 rounded-lg border border-city-blue/20">
                                    <p className="text-sm text-urban-steel/70 mb-1">
                                      Answer:
                                    </p>
                                    <p className="text-sm text-urban-steel italic">
                                      Individual sub-question scores are not stored. 
                                      This question contributed to the point score of {pointScore.toFixed(2)}.
                                    </p>
                                  </div>

                                  {/* Reflection Note */}
                                  {reflectionNote && typeof reflectionNote === 'string' && (
                                    <div className="mt-3 p-3 bg-warm-sand rounded-lg border border-gospel-gold/30">
                                      <p className="text-xs font-semibold text-urban-steel uppercase tracking-wide mb-2">
                                        Reflection Notes
                                      </p>
                                      <p className="text-sm text-urban-steel whitespace-pre-wrap">
                                        {reflectionNote}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-light-city-gray px-6 py-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-city-blue px-4 py-2 font-semibold text-white hover:bg-city-blue/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

