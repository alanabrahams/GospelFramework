"use client";

import { useState, useEffect } from "react";
import type { SubQuestion } from "@/types/questions";

interface QuestionViewProps {
  question: SubQuestion;
  selectedScore: number | null;
  onSelect: (score: number) => void;
}

export default function QuestionView({
  question,
  selectedScore,
  onSelect,
}: QuestionViewProps) {
  const [sliderValue, setSliderValue] = useState<number>(selectedScore || 3);

  // Sync slider with selectedScore when it changes externally
  useEffect(() => {
    if (selectedScore !== null) {
      setSliderValue(selectedScore);
    }
  }, [selectedScore]);

  const handleSliderChange = (value: number) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/ui/QuestionView.tsx:26',message:'handleSliderChange called',data:{value,stackTrace:new Error().stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    setSliderValue(value);
    onSelect(value);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLButtonElement>, score: number) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/457e88c0-383e-45d1-9c47-c412d992d69e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/ui/QuestionView.tsx:31',message:'handleCardClick called',data:{score,stackTrace:new Error().stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    e.preventDefault();
    e.stopPropagation();
    setSliderValue(score);
    onSelect(score);
  };

  return (
    <div className="flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-light-city-gray pb-4 mb-4">
        <h2 className="text-2xl font-bold text-city-blue mb-3 leading-relaxed">
          {question.text}
        </h2>
        
        {/* Slider Container */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-urban-steel">Score</span>
            <span className="text-3xl font-bold text-city-blue">{sliderValue}</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={sliderValue}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-3 bg-light-city-gray rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #1A4D7A 0%, #1A4D7A ${((sliderValue - 1) / 4) * 100}%, #E5E7EB ${((sliderValue - 1) / 4) * 100}%, #E5E7EB 100%)`,
              }}
            />
            <style dangerouslySetInnerHTML={{
              __html: `
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: #1A4D7A;
                  cursor: pointer;
                  border: 3px solid white;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: #1A4D7A;
                  cursor: pointer;
                  border: 3px solid white;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
              `
            }} />
          </div>
          
          <div className="flex justify-between text-xs text-urban-steel/70">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
      </div>

      {/* Option Cards */}
      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = sliderValue === option.score;
          return (
            <button
              key={option.score}
              type="button"
              onClick={(e) => handleCardClick(e, option.score)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? "bg-city-blue/5 border-city-blue shadow-md scale-105 opacity-100"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm opacity-40"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Number Circle */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-city-blue text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <span className="font-semibold text-lg">{option.score}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3
                      className={`font-bold ${
                        isSelected ? "text-city-blue" : "text-urban-steel"
                      }`}
                    >
                      {option.label}
                    </h3>
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-city-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

