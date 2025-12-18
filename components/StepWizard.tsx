"use client";

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function StepWizard({
  currentStep,
  totalSteps,
  stepLabels,
}: StepWizardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    isActive
                      ? "bg-city-blue text-white"
                      : isCompleted
                      ? "bg-gospel-gold text-white"
                      : "bg-light-city-gray text-urban-steel"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-6 h-6"
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
                  ) : (
                    stepNumber
                  )}
                </div>
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-city-blue"
                        : isCompleted
                        ? "text-gospel-gold"
                        : "text-urban-steel"
                    }`}
                  >
                    {label}
                  </div>
                </div>
              </div>
              {/* Connector Line */}
              {index < stepLabels.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    isCompleted ? "bg-gospel-gold" : "bg-light-city-gray"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Progress Bar */}
      <div className="mt-6 w-full bg-light-city-gray rounded-full h-2">
        <div
          className="bg-city-blue h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}







