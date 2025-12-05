"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RadarChart from "@/components/RadarChart";
import {
  type CalculatedScores,
  SECTION_LABELS,
  POINT_LABELS,
} from "@/types/assessment-schema";
import { getPointScoresArray } from "@/lib/calculations";

export default function ResultsPage() {
  const router = useRouter();
  const [submission, setSubmission] = useState<{
    email: string;
    name: string;
    churchName: string;
    scores: CalculatedScores;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const submissionStr = sessionStorage.getItem("submission");
    if (!submissionStr) {
      router.push("/");
      return;
    }

    try {
      const data = JSON.parse(submissionStr);
      setSubmission(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error parsing submission:", error);
      router.push("/");
    }
  }, [router]);

  if (isLoading || !submission) {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center">
        <div className="text-city-blue text-xl">Loading results...</div>
      </div>
    );
  }

  const pointScoresArray = getPointScoresArray(submission.scores);

  return (
    <div className="min-h-screen bg-warm-sand py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-city-blue mb-4">
            Your Church Health Results
          </h1>
          <div className="text-urban-steel space-y-2">
            <p>
              <strong>Name:</strong> {submission.name}
            </p>
            <p>
              <strong>Church:</strong> {submission.churchName}
            </p>
            <p>
              <strong>Email:</strong> {submission.email}
            </p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-city-blue mb-6">
            Overall Health Profile
          </h2>
          <RadarChart scores={pointScoresArray} />
        </div>

        {/* Section Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-city-blue mb-6">
            Section Averages
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-l-4 border-city-blue pl-4">
              <h3 className="text-lg font-semibold text-urban-steel mb-2">
                {SECTION_LABELS.worship}
              </h3>
              <div className="text-3xl font-bold text-city-blue">
                {submission.scores.sections.worship.toFixed(2)}
              </div>
              <div className="text-sm text-urban-steel mt-1">out of 5.0</div>
            </div>
            <div className="border-l-4 border-gospel-gold pl-4">
              <h3 className="text-lg font-semibold text-urban-steel mb-2">
                {SECTION_LABELS.discipleship}
              </h3>
              <div className="text-3xl font-bold text-gospel-gold">
                {submission.scores.sections.discipleship.toFixed(2)}
              </div>
              <div className="text-sm text-urban-steel mt-1">out of 5.0</div>
            </div>
            <div className="border-l-4 border-movement-teal pl-4">
              <h3 className="text-lg font-semibold text-urban-steel mb-2">
                {SECTION_LABELS.mission}
              </h3>
              <div className="text-3xl font-bold text-movement-teal">
                {submission.scores.sections.mission.toFixed(2)}
              </div>
              <div className="text-sm text-urban-steel mt-1">out of 5.0</div>
            </div>
          </div>
        </div>

        {/* Point Scores Detail */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-city-blue mb-6">
            Detailed Scores
          </h2>
          <div className="space-y-4">
            {POINT_LABELS.map((label, index) => {
              const score = pointScoresArray[index];
              const percentage = (score / 5) * 100;
              return (
                <div key={index} className="border-b border-light-city-gray pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-urban-steel">{label}</span>
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

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                // Trigger email send
                fetch("/api/send-email", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(submission),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.success) {
                      alert("Results have been emailed to you!");
                    } else {
                      alert("Error sending email. Please try again.");
                    }
                  })
                  .catch(() => {
                    alert("Error sending email. Please try again.");
                  });
              }}
              className="px-6 py-3 bg-city-blue text-white rounded-lg font-semibold hover:bg-city-blue/90 transition-colors"
            >
              Email Results
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 border border-urban-steel text-urban-steel rounded-lg font-semibold hover:bg-light-city-gray transition-colors"
            >
              Start New Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

