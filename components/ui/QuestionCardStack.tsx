"use client";

import type { Option } from "@/types/questions";

interface QuestionCardStackProps {
  selectedScore: number | null;
  onSelect: (score: number) => void;
  options: Option[];
}

export default function QuestionCardStack({
  selectedScore,
  onSelect,
  options,
}: QuestionCardStackProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selectedScore === option.score;
        return (
          <button
            key={option.score}
            type="button"
            onClick={() => onSelect(option.score)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
              isSelected
                ? "bg-[#1A4D7A]/5 border-[#1A4D7A] shadow-md"
                : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Number Circle */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isSelected
                  ? "bg-[#1A4D7A] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}>
                <span className="font-semibold text-lg">{option.score}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-bold ${
                    isSelected ? "text-[#1A4D7A]" : "text-urban-steel"
                  }`}>
                    {option.label}
                  </h3>
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-[#1A4D7A]"
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
  );
}

