import React from 'react';
import { X, CheckCircle, Brain, Upload } from 'lucide-react';
import MedicalLogo from './MedicalLogo';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  userName: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onSkip, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="welcome-modal-overlay fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="welcome-modal-content bg-gradient-to-br from-[var(--primary-cyan)] via-[var(--accent-teal)] to-[var(--primary-purple)] p-[2px] rounded-3xl shadow-[0_25px_50px_rgba(0,212,170,0.4)] animate-slideInScale max-w-[500px] w-full max-h-[90vh] overflow-y-auto">
        <div className="inner-content bg-[var(--glass-bg)] backdrop-blur-[30px] rounded-3xl p-8 relative border border-[rgba(255,255,255,0.1)]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <MedicalLogo size={80} />
            </div>
            <h1 className="welcome-title font-['Orbitron'] text-3xl font-bold text-[var(--text-primary)] mb-2">
              Welcome to MediLens
            </h1>
            <p className="welcome-subtitle text-[var(--text-secondary)] text-lg">
              Hello {userName}! Let's get you started.
            </p>
          </div>

          {/* Features Section */}
          <div className="features-section mb-8">
            <h3 className="features-title font-['Orbitron'] text-xl font-semibold text-[var(--text-primary)] mb-6 text-center">
              Key Features
            </h3>
            <div className="features-list space-y-4">
              <div className="feature-item flex items-center gap-4 p-3 bg-[rgba(255,255,255,0.05)] rounded-xl border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200">
                <div className="feature-icon w-10 h-10 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-teal)] rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <span className="feature-text text-[var(--text-secondary)] font-medium">
                  Upload your doctor's prescription securely
                </span>
              </div>

              <div className="feature-item flex items-center gap-4 p-3 bg-[rgba(255,255,255,0.05)] rounded-xl border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200">
                <div className="feature-icon w-10 h-10 bg-gradient-to-r from-[var(--accent-teal)] to-[var(--primary-purple)] rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="feature-text text-[var(--text-secondary)] font-medium">
                  View AI-powered health insights
                </span>
              </div>

            </div>
          </div>

          {/* Divider */}
          <div className="divider w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent mb-6"></div>

          {/* Disclaimer Section */}
          <div className="disclaimer-section mb-8">
            <div className="disclaimer-content bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl p-4">
              <p className="disclaimer-text text-[var(--text-secondary)] text-sm leading-relaxed">
                <span className="font-semibold text-[var(--text-primary)]">Disclaimer:</span> MediLens is for informational purposes only and does not provide medical advice. Always consult a qualified healthcare professional for medical concerns.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons flex gap-4 justify-center">
            <button
              onClick={onSkip}
              className="skip-button px-6 py-3 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] border border-[var(--glass-border)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-all duration-200 hover:border-[var(--primary-cyan)] hover:shadow-[0_4px_12px_rgba(0,212,170,0.2)]"
            >
              Skip
            </button>
            <button
              onClick={onClose}
              className="got-it-button px-8 py-3 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white font-bold rounded-xl transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,212,170,0.4)] flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;