import React from "react";

interface StepperLayoutProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  children: React.ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
  onFinish?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
}

const StepperLayout: React.FC<StepperLayoutProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  children,
  onPrevious,
  onNext,
  onFinish,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
}) => {
  return (
    <div className="min-h-full px-10 bg-white">
      {/* Header */}
      <div className="text-sm text-black py-4 border-b border-gray-200">
        Service Category /<span className="text-[#AAAAAA]"> INSURANCE SERVICES / EVALUATE INSURANCE MEDICAL
          NETWORK</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between w-full py-6">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCompleted
                    ? "bg-gray-800 text-white"
                    : isCurrent
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
              </div>
              {stepNumber < totalSteps && (
                <div
                  className={`w-full h-0.5 ${isCompleted ? "bg-gray-800" : "bg-gray-200"
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Title */}
      <div className="py-4">
        <p className="text-sm mb-2.5">Step {currentStep}</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {stepTitles[currentStep - 1]}
        </h1>
      </div>

      {/* Main Content */}
      {children}


      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-center gap-5">
            <button
              onClick={onPrevious}
              disabled={isFirstStep || isLoading}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${isFirstStep || isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#80828533] text-primary hover:bg-[#060662] hover:text-white"
                }`}
            >
              PREVIOUS
            </button>

            <div className="flex space-x-4">
              {isLastStep ? (
                <button
                  onClick={onFinish}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${isLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-primary text-white hover:bg-[#060662]"
                    }`}
                >
                  {isLoading ? "Processing..." : "FINISH"}
                </button>
              ) : (
                <button
                  onClick={onNext}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${isLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-primary text-white hover:bg-[#060662]"
                    }`}
                >
                  {isLoading ? "Processing..." : "NEXT"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepperLayout;
