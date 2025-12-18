"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { QuestionsData, SubQuestion } from "@/types/questions";
import RadarChart from "@/components/RadarChart";
import {
  type CalculatedScores,
  SECTION_LABELS,
  POINT_LABELS,
} from "@/types/assessment-schema";
import { getPointScoresArray } from "@/lib/calculations";
import { fetchAssessments, generateDummyData } from "@/app/actions";
import DetailedAnswersModal from "@/components/ui/DetailedAnswersModal";

type Assessment = {
  id: string;
  created_at: string;
  user_name: string;
  user_email: string;
  church_name: string;
  total_score: number;
  scores_json: any;
  section_scores: any;
  reflection_notes?: any;
};

type Tab = "questions" | "results";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("questions");
  
  // Question Editor State
  const [questions, setQuestions] = useState<QuestionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Results Dashboard State
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [isGeneratingDummy, setIsGeneratingDummy] = useState(false);
  const [isDetailedAnswersOpen, setIsDetailedAnswersOpen] = useState(false);

  // Load questions on mount
  useEffect(() => {
    if (activeTab === "questions") {
      loadQuestions();
    }
  }, [activeTab]);

  // Load assessments when results tab is active
  useEffect(() => {
    if (activeTab === "results") {
      loadAssessments();
    }
  }, [activeTab]);

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

  const loadAssessments = async () => {
    try {
      setIsLoadingAssessments(true);
      const result = await fetchAssessments();
      if (result.success && result.data) {
        setAssessments(result.data as Assessment[]);
      } else {
        console.error("Failed to load assessments:", result.error);
      }
    } catch (err) {
      console.error("Error loading assessments:", err);
    } finally {
      setIsLoadingAssessments(false);
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

  const handleGenerateDummyData = async () => {
    try {
      setIsGeneratingDummy(true);
      const result = await generateDummyData();
      if (result.success) {
        // Reload assessments
        await loadAssessments();
        alert(`Successfully generated ${result.count} dummy assessments!`);
      } else {
        const errorMsg = result.error || "Unknown error";
        console.error("Generate dummy data error:", errorMsg);
        alert(`Failed to generate dummy data:\n\n${errorMsg}\n\nPlease check:\n1. Supabase URL and API key in .env.local\n2. Database table 'assessments' exists\n3. RLS policies are set correctly`);
      }
    } catch (err: any) {
      console.error("Error generating dummy data:", err);
      alert(`Failed to generate dummy data:\n\n${err.message || "Unknown error"}\n\nPlease check your Supabase connection settings.`);
    } finally {
      setIsGeneratingDummy(false);
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
      options: [
        { score: 1, label: "", description: "" },
        { score: 2, label: "", description: "" },
        { score: 3, label: "", description: "" },
        { score: 4, label: "", description: "" },
        { score: 5, label: "", description: "" },
      ],
      reflection_text: "",
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

  const handleOptionChange = (
    sectionId: keyof QuestionsData,
    pointIndex: number,
    subQuestionIndex: number,
    optionIndex: number,
    field: "label" | "description",
    value: string
  ) => {
    if (!questions) return;
    const updated = { ...questions };
    const subQuestion = updated[sectionId].points[pointIndex].subQuestions[subQuestionIndex];
    if (subQuestion.options && subQuestion.options[optionIndex]) {
      subQuestion.options[optionIndex][field] = value;
      setQuestions(updated);
    }
  };

  const handleReflectionTextChange = (
    sectionId: keyof QuestionsData,
    pointIndex: number,
    subQuestionIndex: number,
    value: string
  ) => {
    if (!questions) return;
    const updated = { ...questions };
    updated[sectionId].points[pointIndex].subQuestions[subQuestionIndex].reflection_text = value;
    setQuestions(updated);
  };

  // Convert assessment data to CalculatedScores format
  const getCalculatedScores = (assessment: Assessment): CalculatedScores => {
    return {
      points: {
        scriptureGospelCentrality: assessment.scores_json.scriptureGospelCentrality,
        worshipPreachingSacraments: assessment.scores_json.worshipPreachingSacraments,
        primacyOfPrayer: assessment.scores_json.primacyOfPrayer,
        discipleshipPracticedIntentionally: assessment.scores_json.discipleshipPracticedIntentionally,
        ntPatternsOfChurchLife: assessment.scores_json.ntPatternsOfChurchLife,
        leadershipDevelopment: assessment.scores_json.leadershipDevelopment,
        cultureOfGenerosity: assessment.scores_json.cultureOfGenerosity,
        cityCultureEngagement: assessment.scores_json.cityCultureEngagement,
        evangelismContextualization: assessment.scores_json.evangelismContextualization,
        churchPlantingPartnerships: assessment.scores_json.churchPlantingPartnerships,
      },
      sections: {
        worship: assessment.section_scores.worship,
        discipleship: assessment.section_scores.discipleship,
        mission: assessment.section_scores.mission,
      },
    };
  };

  const sections: Array<{ id: keyof QuestionsData; title: string }> = [
    { id: "worship", title: "Worship" },
    { id: "discipleship", title: "Discipleship" },
    { id: "mission", title: "Mission" },
  ];

  return (
    <div className="min-h-screen bg-warm-sand py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-city-blue mb-2">
                Admin Dashboard
              </h1>
              <p className="text-urban-steel">
                Manage questions and view assessment results
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 border border-urban-steel text-urban-steel rounded-lg font-semibold hover:bg-light-city-gray transition-colors"
            >
              Back to Home
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-light-city-gray">
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-6 py-2 font-semibold transition-colors ${
                activeTab === "questions"
                  ? "text-city-blue border-b-2 border-city-blue"
                  : "text-urban-steel hover:text-city-blue"
              }`}
            >
              Question Editor
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`px-6 py-2 font-semibold transition-colors ${
                activeTab === "results"
                  ? "text-city-blue border-b-2 border-city-blue"
                  : "text-urban-steel hover:text-city-blue"
              }`}
            >
              Results Dashboard
            </button>
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

        {/* Question Editor Tab */}
        {activeTab === "questions" && (
          <>
            {isLoading ? (
              <div className="min-h-screen bg-warm-sand flex items-center justify-center">
                <div className="text-city-blue text-xl">Loading questions...</div>
              </div>
            ) : !questions ? (
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
                </div>
              </div>
            ) : (
              <>
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

                                  {/* Sub-Question Content */}
                                  <div className="flex-1 space-y-4">
                                    <div>
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

                                    {/* Options Editor */}
                                    <div>
                                      <label className="block text-xs font-medium text-urban-steel mb-2">
                                        Options (5 required, scores 1-5)
                                      </label>
                                      <div className="space-y-2">
                                        {('options' in subQuestion && subQuestion.options) ? (
                                          subQuestion.options.map((option, optIndex) => (
                                            <div
                                              key={optIndex}
                                              className="p-3 bg-white border border-light-city-gray rounded-lg"
                                            >
                                              <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-semibold text-city-blue w-8">
                                                  Score {option.score}:
                                                </span>
                                                <input
                                                  type="text"
                                                  value={option.label}
                                                  onChange={(e) =>
                                                    handleOptionChange(
                                                      section.id,
                                                      pointIndex,
                                                      sqIndex,
                                                      optIndex,
                                                      "label",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="Option label"
                                                  className="flex-1 px-3 py-1 text-sm bg-white text-urban-steel border border-light-city-gray rounded focus:outline-none focus:ring-2 focus:ring-city-blue"
                                                />
                                              </div>
                                              <textarea
                                                value={option.description}
                                                onChange={(e) =>
                                                  handleOptionChange(
                                                    section.id,
                                                    pointIndex,
                                                    sqIndex,
                                                    optIndex,
                                                    "description",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Option description"
                                                rows={2}
                                                className="w-full px-3 py-1 text-sm bg-white text-urban-steel border border-light-city-gray rounded focus:outline-none focus:ring-2 focus:ring-city-blue resize-y"
                                              />
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-xs text-urban-steel/70 p-2 bg-white border border-light-city-gray rounded">
                                            Options will be created automatically. Ensure sub-question has options array.
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Reflection Text Editor */}
                                    <div>
                                      <label className="block text-xs font-medium text-urban-steel mb-1">
                                        Reflection Text
                                      </label>
                                      <textarea
                                        value={'reflection_text' in subQuestion ? subQuestion.reflection_text || "" : ""}
                                        onChange={(e) =>
                                          handleReflectionTextChange(
                                            section.id,
                                            pointIndex,
                                            sqIndex,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Theological reflection prompt for this question"
                                        rows={3}
                                        className="w-full px-4 py-2 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue resize-y"
                                      />
                                    </div>
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
              </>
            )}
          </>
        )}

        {/* Results Dashboard Tab */}
        {activeTab === "results" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Action Buttons */}
            <div className="mb-6 flex gap-4">
              <button
                onClick={handleGenerateDummyData}
                disabled={isGeneratingDummy}
                className="px-6 py-2 bg-gospel-gold text-white rounded-lg font-semibold hover:bg-gospel-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingDummy ? "Generating..." : "Generate Dummy Data"}
              </button>
              <button
                onClick={loadAssessments}
                disabled={isLoadingAssessments}
                className="px-6 py-2 border border-urban-steel text-urban-steel rounded-lg font-semibold hover:bg-light-city-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingAssessments ? "Loading..." : "Refresh"}
              </button>
            </div>

            {/* Two-Panel Layout */}
            <div className="flex gap-6 h-[calc(100vh-300px)]">
              {/* Left Panel - Assessment List (1/3 width) */}
              <div className="w-1/3 border-r border-light-city-gray pr-6 overflow-y-auto">
                <h2 className="text-xl font-bold text-city-blue mb-4">
                  Assessments ({assessments.length})
                </h2>
                {isLoadingAssessments ? (
                  <div className="text-urban-steel">Loading assessments...</div>
                ) : assessments.length === 0 ? (
                  <div className="text-urban-steel">
                    No assessments found. Generate dummy data to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assessments.map((assessment) => (
                      <button
                        key={assessment.id}
                        onClick={() => setSelectedAssessment(assessment)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedAssessment?.id === assessment.id
                            ? "bg-city-blue text-white border-city-blue"
                            : "bg-white text-urban-steel border-light-city-gray hover:bg-warm-sand/50"
                        }`}
                      >
                        <div className="font-semibold mb-1">
                          {assessment.user_name}
                        </div>
                        <div className="text-sm opacity-80">
                          {assessment.church_name}
                        </div>
                        <div className="text-xs mt-1 opacity-70">
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Panel - Results View (2/3 width) */}
              <div className="w-2/3 pl-6 overflow-y-auto">
                {!selectedAssessment ? (
                  <div className="flex items-center justify-center h-full text-urban-steel">
                    <div className="text-center">
                      <p className="text-lg mb-2">Select an assessment to view results</p>
                      <p className="text-sm">Choose from the list on the left</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-warm-sand/30 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-city-blue">
                          Assessment Results
                        </h2>
                        <button
                          onClick={() => setIsDetailedAnswersOpen(true)}
                          className="px-4 py-2 bg-city-blue text-white rounded-lg font-semibold hover:bg-city-blue/90 transition-colors"
                        >
                          View Detailed Answers
                        </button>
                      </div>
                      <div className="text-urban-steel space-y-2">
                        <p>
                          <strong>Name:</strong> {selectedAssessment.user_name}
                        </p>
                        <p>
                          <strong>Church:</strong> {selectedAssessment.church_name}
                        </p>
                        <p>
                          <strong>Email:</strong> {selectedAssessment.user_email}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(selectedAssessment.created_at).toLocaleString()}
                        </p>
                        <p>
                          <strong>Total Score:</strong>{" "}
                          {selectedAssessment.total_score.toFixed(2)} / 5.0
                        </p>
                      </div>
                    </div>

                    {/* Radar Chart */}
                    {(() => {
                      const scores = getCalculatedScores(selectedAssessment);
                      const pointScoresArray = getPointScoresArray(scores);
                      return (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h3 className="text-xl font-bold text-city-blue mb-4">
                            Overall Health Profile
                          </h3>
                          <RadarChart scores={pointScoresArray} />
                        </div>
                      );
                    })()}

                    {/* Section Breakdown */}
                    {(() => {
                      const scores = getCalculatedScores(selectedAssessment);
                      return (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h3 className="text-xl font-bold text-city-blue mb-4">
                            Section Averages
                          </h3>
                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="border-l-4 border-city-blue pl-4">
                              <h4 className="text-lg font-semibold text-urban-steel mb-2">
                                {SECTION_LABELS.worship}
                              </h4>
                              <div className="text-3xl font-bold text-city-blue">
                                {scores.sections.worship.toFixed(2)}
                              </div>
                              <div className="text-sm text-urban-steel mt-1">out of 5.0</div>
                            </div>
                            <div className="border-l-4 border-gospel-gold pl-4">
                              <h4 className="text-lg font-semibold text-urban-steel mb-2">
                                {SECTION_LABELS.discipleship}
                              </h4>
                              <div className="text-3xl font-bold text-gospel-gold">
                                {scores.sections.discipleship.toFixed(2)}
                              </div>
                              <div className="text-sm text-urban-steel mt-1">out of 5.0</div>
                            </div>
                            <div className="border-l-4 border-movement-teal pl-4">
                              <h4 className="text-lg font-semibold text-urban-steel mb-2">
                                {SECTION_LABELS.mission}
                              </h4>
                              <div className="text-3xl font-bold text-movement-teal">
                                {scores.sections.mission.toFixed(2)}
                              </div>
                              <div className="text-sm text-urban-steel mt-1">out of 5.0</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Point Scores Detail */}
                    {(() => {
                      const scores = getCalculatedScores(selectedAssessment);
                      const pointScoresArray = getPointScoresArray(scores);
                      return (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h3 className="text-xl font-bold text-city-blue mb-4">
                            Detailed Scores
                          </h3>
                          <div className="space-y-4">
                            {POINT_LABELS.map((label, index) => {
                              const score = pointScoresArray[index];
                              const percentage = (score / 5) * 100;
                              return (
                                <div
                                  key={index}
                                  className="border-b border-light-city-gray pb-4 last:border-0"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-urban-steel">
                                      {label}
                                    </span>
                                    <span className="text-lg font-semibold text-city-blue">
                                      {score.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="w-full bg-light-city-gray rounded-full h-2">
                                    <div
                                      className="bg-city-blue h-2 rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Detailed Responses with Option Labels and Reflection Notes */}
                    {questions && selectedAssessment.reflection_notes && (() => {
                      // Helper to get option label from score
                      const getOptionLabel = (subQuestionId: string, score: number): string => {
                        // Find the sub-question in questions data
                        for (const section of Object.values(questions)) {
                          for (const point of section.points) {
                            const subQuestion = point.subQuestions.find((sq: SubQuestion) => sq.id === subQuestionId);
                            if (subQuestion && 'options' in subQuestion && subQuestion.options) {
                              const option = subQuestion.options.find((opt: { score: number; label: string; description: string }) => opt.score === score);
                              return option ? option.label : `Score ${score}`;
                            }
                          }
                        }
                        return `Score ${score}`;
                      };

                      // Reconstruct assessment responses from stored data
                      // Note: This assumes the assessment.assessment structure matches AssessmentResponse
                      // We'll need to get this from the stored submission or reconstruct from scores_json
                      // For now, we'll show reflection notes if available
                      const reflectionNotes = selectedAssessment.reflection_notes || {};
                      
                      return (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h3 className="text-xl font-bold text-city-blue mb-4">
                            Detailed Responses
                          </h3>
                          <div className="space-y-6">
                            {Object.entries(reflectionNotes).map(([subQuestionId, note]) => {
                              if (!note || typeof note !== 'string') return null;
                              
                              // Find the sub-question to get its text
                              let subQuestionText = subQuestionId;
                              for (const section of Object.values(questions)) {
                                for (const point of section.points) {
                                  const subQuestion = point.subQuestions.find((sq: SubQuestion) => sq.id === subQuestionId);
                                  if (subQuestion) {
                                    subQuestionText = subQuestion.text;
                                    break;
                                  }
                                }
                              }
                              
                              return (
                                <div key={subQuestionId} className="border-b border-light-city-gray pb-4 last:border-b-0">
                                  <div className="mb-2">
                                    <p className="font-medium text-urban-steel text-sm mb-1">
                                      {subQuestionText}
                                    </p>
                                  </div>
                                  <div className="bg-warm-sand/30 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-urban-steel uppercase tracking-wide mb-2">
                                      Reflection Notes
                                    </p>
                                    <p className="text-urban-steel whitespace-pre-wrap">
                                      {note}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            {Object.keys(reflectionNotes).length === 0 && (
                              <p className="text-urban-steel/70 text-sm">
                                No reflection notes available for this assessment.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Answers Modal */}
      {selectedAssessment && (
        <DetailedAnswersModal
          isOpen={isDetailedAnswersOpen}
          onClose={() => setIsDetailedAnswersOpen(false)}
          assessment={selectedAssessment}
          questions={questions}
        />
      )}
    </div>
  );
}
