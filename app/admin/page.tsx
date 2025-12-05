"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { QuestionsData, SubQuestion, Point, Section } from "@/types/questions";

export default function AdminPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/questions");
      if (!response.ok) {
        throw new Error("Failed to load questions");
      }
      const data = await response.json();
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError("Failed to load questions. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!questions) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questions),
      });

      if (!response.ok) {
        throw new Error("Failed to save questions");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save questions. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePointTitleChange = (
    sectionId: keyof QuestionsData,
    pointIndex: number,
    value: string
  ) => {
    if (!questions) return;
    const updated = { ...questions };
    updated[sectionId].points[pointIndex].title = value;
    setQuestions(updated);
  };

  const handlePointDescriptionChange = (
    sectionId: keyof QuestionsData,
    pointIndex: number,
    value: string
  ) => {
    if (!questions) return;
    const updated = { ...questions };
    updated[sectionId].points[pointIndex].description = value;
    setQuestions(updated);
  };

  const handleSubQuestionTextChange = (
    sectionId: keyof QuestionsData,
    pointIndex: number,
    subQuestionIndex: number,
    value: string
  ) => {
    if (!questions) return;
    const updated = { ...questions };
    updated[sectionId].points[pointIndex].subQuestions[subQuestionIndex].text =
      value;
    setQuestions(updated);
  };

  const handleAddSubQuestion = (
    sectionId: keyof QuestionsData,
    pointIndex: number
  ) => {
    if (!questions) return;
    const updated = { ...questions };
    const point = updated[sectionId].points[pointIndex];
    const newOrder = point.subQuestions.length + 1;
    const newSubQuestion: SubQuestion = {
      id: `${point.id}.${newOrder}`,
      text: "",
      order: newOrder,
    };
    point.subQuestions.push(newSubQuestion);
    setQuestions(updated);
  };

  const handleRemoveSubQuestion = (
    sectionId: keyof QuestionsData,
    pointIndex: number,
    subQuestionIndex: number
  ) => {
    if (!questions) return;
    const updated = { ...questions };
    const point = updated[sectionId].points[pointIndex];

    if (point.subQuestions.length <= 1) {
      alert("Each point must have at least one sub-question");
      return;
    }

    point.subQuestions.splice(subQuestionIndex, 1);
    // Reorder remaining sub-questions
    point.subQuestions.forEach((sq, idx) => {
      sq.order = idx + 1;
    });
    setQuestions(updated);
  };

  const handleMoveSubQuestion = (
    sectionId: keyof QuestionsData,
    pointIndex: number,
    subQuestionIndex: number,
    direction: "up" | "down"
  ) => {
    if (!questions) return;
    const updated = { ...questions };
    const point = updated[sectionId].points[pointIndex];
    const subQuestions = [...point.subQuestions];

    if (
      (direction === "up" && subQuestionIndex === 0) ||
      (direction === "down" && subQuestionIndex === subQuestions.length - 1)
    ) {
      return; // Can't move further
    }

    const newIndex = direction === "up" ? subQuestionIndex - 1 : subQuestionIndex + 1;
    [subQuestions[subQuestionIndex], subQuestions[newIndex]] = [
      subQuestions[newIndex],
      subQuestions[subQuestionIndex],
    ];

    // Update order values
    subQuestions.forEach((sq, idx) => {
      sq.order = idx + 1;
    });

    point.subQuestions = subQuestions;
    setQuestions(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center">
        <div className="text-city-blue text-xl">Loading questions...</div>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-city-blue mb-4">
            Error Loading Questions
          </h1>
          <p className="text-urban-steel mb-4">{error}</p>
          <button
            onClick={loadQuestions}
            className="px-4 py-2 bg-city-blue text-white rounded-lg hover:bg-city-blue/90"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/")}
            className="ml-4 px-4 py-2 border border-urban-steel text-urban-steel rounded-lg hover:bg-light-city-gray"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const sections: Array<{ id: keyof QuestionsData; title: string }> = [
    { id: "worship", title: "Worship" },
    { id: "discipleship", title: "Discipleship" },
    { id: "mission", title: "Mission" },
  ];

  return (
    <div className="min-h-screen bg-warm-sand py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-city-blue mb-2">
                Question Editor
              </h1>
              <p className="text-urban-steel">
                Edit questions and sub-questions for the assessment
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 border border-urban-steel text-urban-steel rounded-lg font-semibold hover:bg-light-city-gray transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-city-blue text-white rounded-lg font-semibold hover:bg-city-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Questions saved successfully!
            </div>
          )}
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const sectionData = questions[section.id];
          return (
            <div key={section.id} className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-city-blue mb-6">
                {sectionData.title}
              </h2>

              {/* Points */}
              {sectionData.points.map((point, pointIndex) => (
                <div
                  key={point.id}
                  className="mb-8 pb-8 border-b border-light-city-gray last:border-b-0"
                >
                  {/* Point Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-urban-steel mb-2">
                      Point Title
                    </label>
                    <input
                      type="text"
                      value={point.title}
                      onChange={(e) =>
                        handlePointTitleChange(section.id, pointIndex, e.target.value)
                      }
                      className="w-full px-4 py-2 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue"
                    />
                  </div>

                  {/* Point Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-urban-steel mb-2">
                      Point Description
                    </label>
                    <input
                      type="text"
                      value={point.description || ""}
                      onChange={(e) =>
                        handlePointDescriptionChange(
                          section.id,
                          pointIndex,
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue"
                    />
                  </div>

                  {/* Sub-Questions */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-urban-steel">
                        Sub-Questions
                      </label>
                      <button
                        onClick={() => handleAddSubQuestion(section.id, pointIndex)}
                        className="px-3 py-1 text-sm bg-gospel-gold text-white rounded-lg hover:bg-gospel-gold/90 transition-colors"
                      >
                        + Add Sub-Question
                      </button>
                    </div>

                    {point.subQuestions.map((subQuestion, sqIndex) => (
                      <div
                        key={subQuestion.id}
                        className="mb-4 p-4 border border-light-city-gray rounded-lg bg-warm-sand/30"
                      >
                        <div className="flex items-start gap-3">
                          {/* Reorder Buttons */}
                          <div className="flex flex-col gap-1 pt-2">
                            <button
                              onClick={() =>
                                handleMoveSubQuestion(
                                  section.id,
                                  pointIndex,
                                  sqIndex,
                                  "up"
                                )
                              }
                              disabled={sqIndex === 0}
                              className="px-2 py-1 text-xs border border-urban-steel text-urban-steel rounded hover:bg-light-city-gray disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() =>
                                handleMoveSubQuestion(
                                  section.id,
                                  pointIndex,
                                  sqIndex,
                                  "down"
                                )
                              }
                              disabled={sqIndex === point.subQuestions.length - 1}
                              className="px-2 py-1 text-xs border border-urban-steel text-urban-steel rounded hover:bg-light-city-gray disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              ↓
                            </button>
                          </div>

                          {/* Sub-Question Text */}
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-urban-steel mb-1">
                              Sub-Question {sqIndex + 1}
                            </label>
                            <textarea
                              value={subQuestion.text}
                              onChange={(e) =>
                                handleSubQuestionTextChange(
                                  section.id,
                                  pointIndex,
                                  sqIndex,
                                  e.target.value
                                )
                              }
                              rows={3}
                              className="w-full px-4 py-2 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue resize-y"
                            />
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() =>
                              handleRemoveSubQuestion(section.id, pointIndex, sqIndex)
                            }
                            disabled={point.subQuestions.length <= 1}
                            className="px-3 py-1 text-sm bg-grace-coral text-white rounded-lg hover:bg-grace-coral/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-6"
                            title="Remove sub-question"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Footer Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 border border-urban-steel text-urban-steel rounded-lg font-semibold hover:bg-light-city-gray transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-city-blue text-white rounded-lg font-semibold hover:bg-city-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

