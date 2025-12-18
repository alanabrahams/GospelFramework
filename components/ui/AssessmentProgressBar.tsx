"use client";

import { Check, BookOpen, Users, Globe } from "lucide-react";

const SECTIONS = [
  { id: 1, title: "Worship", icon: BookOpen },
  { id: 2, title: "Discipleship", icon: Users },
  { id: 3, title: "Mission", icon: Globe },
];

interface AssessmentProgressBarProps {
  currentSection: number; // 1, 2, or 3
  completedSections: number[]; // Array of completed IDs, e.g. [1]
  progressInCurrent: number; // 0-100 (or step count) used to calculate width of the gold bar
  onSectionClick?: (sectionId: number) => void; // Optional callback when section is clicked
}

export default function AssessmentProgressBar({
  currentSection,
  completedSections,
  progressInCurrent,
  onSectionClick,
}: AssessmentProgressBarProps) {
  return (
    <div className="w-full flex flex-row gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = currentSection === section.id;
        const isCompleted = completedSections.includes(section.id);
        const isLocked = !isActive && !isCompleted;

        return (
          <button
            key={section.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (!isLocked && onSectionClick) {
                onSectionClick(section.id);
              }
            }}
            disabled={isLocked}
            className={`
              flex-1 min-w-[140px] md:min-w-[180px] rounded-xl p-4 relative
              transition-all duration-300 text-left
              ${
                isActive
                  ? "bg-white shadow-lg opacity-100"
                  : isCompleted
                  ? "bg-movement-teal/10 opacity-100 hover:bg-movement-teal/20"
                  : "bg-white/50 opacity-60"
              }
              ${!isLocked && onSectionClick ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed"}
            `}
          >
            {/* Icon and Title */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`
                  p-2 rounded-lg
                  ${
                    isActive
                      ? "bg-city-blue/10 text-city-blue"
                      : isCompleted
                      ? "bg-white text-movement-teal"
                      : "bg-light-city-gray text-urban-steel"
                  }
                `}
              >
                <Icon size={18} />
              </div>
              <h3
                className={`
                  font-semibold text-sm
                  ${
                    isActive
                      ? "text-city-blue"
                      : isCompleted
                      ? "text-movement-teal"
                      : "text-urban-steel"
                  }
                `}
              >
                {section.title}
              </h3>
            </div>

            {/* State Indicator */}
            <div className="flex items-center justify-between">
              {isActive && (
                <span className="text-xs text-urban-steel/70 font-medium">
                  In Progress...
                </span>
              )}
              {isCompleted && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-movement-teal flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-xs text-movement-teal font-medium">
                    Completed
                  </span>
                </div>
              )}
              {isLocked && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-urban-steel/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="text-xs text-urban-steel/60 font-medium">
                    Locked
                  </span>
                </div>
              )}
            </div>

            {/* Gold Progress Bar (only for active section) */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-light-city-gray rounded-b-xl overflow-hidden">
                <div
                  className="h-full bg-gospel-gold transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progressInCurrent))}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

