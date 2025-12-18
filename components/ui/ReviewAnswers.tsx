"use client";

import { X } from "lucide-react";
import type { QuestionsData, SubQuestion } from "@/types/questions";

interface ReviewAnswersProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionsData | null;
  answers: Record<string, number>;
  reflections: Record<string, string>;
  currentQuestionId: string | null;
  onNavigateToQuestion: (questionId: string) => void;
}

export default function ReviewAnswers({
  isOpen,
  onClose,
  questions,
  answers,
  reflections,
  currentQuestionId,
  onNavigateToQuestion,
}: ReviewAnswersProps) {
  if (!isOpen || !questions) return null;

  // Get all questions with their answers
  const getAllQuestionsWithAnswers = (): Array<{
    question: SubQuestion;
    answer: number | null;
    reflection: string;
    section: string;
    pointTitle: string;
  }> => {
    const result: Array<{
      question: SubQuestion;
      answer: number | null;
      reflection: string;
      section: string;
      pointTitle: string;
    }> = [];

    const sections = [
      { data: questions.worship, name: "Worship" },
      { data: questions.discipleship, name: "Discipleship" },
      { data: questions.mission, name: "Mission" },
    ];

    sections.forEach(({ data, name }) => {
      data.points.forEach((point) => {
        point.subQuestions
          .sort((a, b) => a.order - b.order)
          .forEach((subQuestion) => {
            result.push({
              question: subQuestion,
              answer: answers[subQuestion.id] || null,
              reflection: reflections[subQuestion.id] || "",
              section: name,
              pointTitle: point.title,
            });
          });
      });
    });

    return result;
  };

  const questionsWithAnswers = getAllQuestionsWithAnswers();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-light-city-gray px-6 py-4">
            <h2 className="text-2xl font-bold text-city-blue">Review Your Answers</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-urban-steel hover:bg-light-city-gray transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {questionsWithAnswers.map((item, index) => {
                const isAnswered = item.answer !== null;
                const isCurrent = item.question.id === currentQuestionId;
                const option = item.question.options.find(
                  (opt) => opt.score === item.answer
                );

                return (
                  <div
                    key={item.question.id}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      isCurrent
                        ? "border-city-blue bg-city-blue/5"
                        : isAnswered
                        ? "border-gray-200 bg-white"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-sm font-semibold text-urban-steel">
                            {item.section} • {item.pointTitle}
                          </span>
                          {isCurrent && (
                            <span className="rounded-full bg-city-blue px-2 py-0.5 text-xs font-medium text-white">
                              Current
                            </span>
                          )}
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-city-blue">
                          {item.question.text}
                        </h3>
                        {isAnswered && option ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-city-blue text-sm font-bold text-white">
                                {item.answer}
                              </div>
                              <span className="font-semibold text-urban-steel">
                                {option.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{option.description}</p>
                            {item.reflection && (
                              <div className="mt-3 rounded-lg bg-warm-sand p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-urban-steel/70 mb-1">
                                  Your Reflection
                                </p>
                                <p className="text-sm text-urban-steel">{item.reflection}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm italic text-gray-400">Not answered yet</p>
                        )}
                      </div>
                      {isAnswered && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateToQuestion(item.question.id);
                            onClose();
                          }}
                          className="rounded-lg border border-city-blue px-3 py-1.5 text-sm font-medium text-city-blue hover:bg-city-blue/10 transition-colors"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-light-city-gray px-6 py-4">
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

