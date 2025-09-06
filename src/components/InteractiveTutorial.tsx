import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  arrowDirection: 'up' | 'down' | 'left' | 'right';
}

interface InteractiveTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'prescription-upload',
    targetId: 'prescription-upload-button',
    title: 'Upload Your Prescription',
    description: 'Start here by securely uploading your doctor\'s prescription for AI-powered analysis.',
    position: 'top',
    arrowDirection: 'down'
  },
  {
    id: 'dashboard-reports',
    targetId: 'answers-section',
    title: 'Your Health Dashboard',
    description: 'Your uploaded prescriptions and AI health reports will appear here for easy access.',
    position: 'top',
    arrowDirection: 'down'
  },
  {
    id: 'ai-insights',
    targetId: 'ai-consultation-button',
    title: 'Ask Questions',
    description: 'Get instant answers about medications, side effects, dosage, and health-related questions.',
    position: 'top',
    arrowDirection: 'down'
  },
  {
    id: 'medicine-search',
    targetId: 'medicine-search-button',
    title: 'Search Medicine Information',
    description: 'Search for detailed medicine information including usage, dosage, side effects, and interactions from trusted databases.',
    position: 'top',
    arrowDirection: 'down'
  },
  {
    id: 'profile-settings',
    targetId: 'user-profile-section',
    title: 'Profile & Settings',
    description: 'Manage your personal details, notifications, and privacy settings from your profile.',
    position: 'left',
    arrowDirection: 'right'
  }
];

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ 
  isVisible, 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowTutorial(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowTutorial(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && showTutorial) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible, showTutorial, currentStep]);

  const updatePosition = () => {
    const step = tutorialSteps[currentStep];
    const targetElement = document.getElementById(step.targetId);
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setTargetRect(rect);
      
      let top = 0;
      let left = 0;
      
      switch (step.position) {
        case 'top':
          top = rect.top + scrollTop - 200;
          left = rect.left + scrollLeft + rect.width / 2 - 200;
          break;
        case 'bottom':
          top = rect.bottom + scrollTop + 50;
          left = rect.left + scrollLeft + rect.width / 2 - 200;
          break;
        case 'left':
          top = rect.top + scrollTop + rect.height / 2 - 100;
          left = rect.left + scrollLeft - 450;
          break;
        case 'right':
          top = rect.top + scrollTop + rect.height / 2 - 100;
          left = rect.right + scrollLeft + 50;
          break;
      }
      
      // Ensure popup stays within viewport
      const maxLeft = window.innerWidth - 400 - 20;
      const maxTop = window.innerHeight + scrollTop - 250;
      
      setPosition({
        top: Math.max(20, Math.min(top, maxTop)),
        left: Math.max(20, Math.min(left, maxLeft))
      });
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setShowTutorial(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    setShowTutorial(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  const getArrowPosition = () => {
    if (!targetRect) return {};
    
    const step = tutorialSteps[currentStep];
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    switch (step.arrowDirection) {
      case 'down':
        return {
          top: position.top + 180,
          left: position.left + 200 - 16,
        };
      case 'up':
        return {
          top: position.top - 40,
          left: position.left + 200 - 16,
        };
      case 'right':
        return {
          top: position.top + 100 - 16,
          left: position.left + 400,
        };
      case 'left':
        return {
          top: position.top + 100 - 16,
          left: position.left - 40,
        };
      default:
        return {};
    }
  };

  const getSpotlightStyle = () => {
    if (!targetRect) return {};
    
    const padding = 20;
    return {
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
    };
  };

  if (!isVisible) return null;

  const currentStepData = tutorialSteps[currentStep];
  const arrowPos = getArrowPosition();
  const spotlightStyle = getSpotlightStyle();

  return (
    <div 
      ref={overlayRef}
      className={`tutorial-overlay fixed inset-0 z-[300] transition-all duration-500 ${
        showTutorial ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Dark overlay with spotlight cutout */}
      <div className="absolute inset-0 bg-black bg-opacity-70 transition-opacity duration-500">
        {targetRect && (
          <div
            className="absolute bg-transparent border-4 border-[var(--primary-cyan)] rounded-xl shadow-[0_0_30px_rgba(0,212,170,0.6)] transition-all duration-500"
            style={spotlightStyle}
          />
        )}
      </div>

      {/* Tutorial popup */}
      <div
        className={`tutorial-popup absolute bg-gradient-to-br from-[var(--primary-cyan)] via-[var(--accent-teal)] to-[var(--primary-purple)] p-6 rounded-2xl shadow-[0_25px_50px_rgba(0,212,170,0.4)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] max-w-[400px] w-[calc(100vw-40px)] transition-all duration-500 ${
          showTutorial ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress indicator */}
        <div className="flex justify-center mb-4">
          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-white scale-125'
                    : index < currentStep
                    ? 'bg-white bg-opacity-70'
                    : 'bg-white bg-opacity-30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="text-white mb-6">
          <h3 className="text-xl font-bold mb-3 font-['Orbitron']">
            {currentStepData.title}
          </h3>
          <p className="text-sm leading-relaxed opacity-95">
            {currentStepData.description}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:bg-opacity-30"
            >
              Skip Tutorial
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-[var(--primary-cyan)] text-sm font-bold transition-all duration-200 hover:bg-opacity-90 hover:shadow-lg"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Animated arrow */}
      {targetRect && (
        <div
          className="tutorial-arrow absolute pointer-events-none transition-all duration-500"
          style={arrowPos}
        >
          <div className="relative">
            {currentStepData.arrowDirection === 'down' && (
              <div className="w-8 h-8 text-[var(--primary-cyan)] animate-bounce">
                <svg
                  className="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,212,170,0.8)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l-8 8h5v10h6V10h5l-8-8z" transform="rotate(180 12 12)" />
                </svg>
              </div>
            )}
            {currentStepData.arrowDirection === 'up' && (
              <div className="w-8 h-8 text-[var(--primary-cyan)] animate-bounce">
                <svg
                  className="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,212,170,0.8)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l-8 8h5v10h6V10h5l-8-8z" />
                </svg>
              </div>
            )}
            {currentStepData.arrowDirection === 'right' && (
              <div className="w-8 h-8 text-[var(--primary-cyan)] animate-bounce">
                <svg
                  className="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,212,170,0.8)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l-8 8h5v10h6V10h5l-8-8z" transform="rotate(-90 12 12)" />
                </svg>
              </div>
            )}
            {currentStepData.arrowDirection === 'left' && (
              <div className="w-8 h-8 text-[var(--primary-cyan)] animate-bounce">
                <svg
                  className="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,212,170,0.8)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l-8 8h5v10h6V10h5l-8-8z" transform="rotate(90 12 12)" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveTutorial;