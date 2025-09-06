import React from 'react';
import { X, FileText, Shield } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.8)] backdrop-blur-[5px] z-[1000] flex justify-center items-center p-5">
      <div className="modal-content bg-[var(--glass-bg)] backdrop-blur-[30px] border border-[var(--glass-border)] rounded-[20px] p-8 max-w-[700px] w-full max-h-[80vh] overflow-y-auto relative">
        <div className="modal-header flex justify-between items-center mb-6 sticky top-0 bg-[var(--glass-bg)] backdrop-blur-[30px] pb-4 border-b border-[var(--glass-border)]">
          <h2 className="modal-title font-['Orbitron'] text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3">
            <FileText className="w-6 h-6 text-[var(--primary-cyan)]" />
            Terms & Conditions
          </h2>
          <button
            onClick={onClose}
            className="close-btn bg-none border-none text-[var(--text-muted)] text-2xl cursor-pointer p-1 hover:text-[var(--text-primary)] transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="terms-content text-[var(--text-secondary)] leading-[1.7] space-y-6">
          {/* Terms & Conditions Section */}
          <div className="terms-section">
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--primary-cyan)]" />
              Terms & Conditions
            </h3>
            
            <div className="space-y-4">
              <div className="term-item">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">1. Acceptance of Terms</h4>
                <p>By creating an account or signing in to MediLens, you agree to comply with and be bound by these Terms of Use. If you do not agree, please do not use MediLens.</p>
              </div>

              <div className="term-item">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">2. User Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You agree to provide accurate and complete information during signup.</li>
                  <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                  <li>You agree not to use MediLens for unlawful, harmful, or unauthorized purposes.</li>
                </ul>
              </div>

              <div className="term-item">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">3. Privacy & Data</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>MediLens may collect and process certain personal information in accordance with our Privacy Policy.</li>
                  <li>Your data will not be sold to third parties and will be used only to provide and improve our services.</li>
                </ul>
              </div>

              <div className="term-item">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">4. Service Limitations</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>MediLens is a digital platform intended to assist with healthcare-related insights and information.</li>
                  <li>It is not a substitute for professional medical advice, diagnosis, or treatment.</li>
                </ul>
              </div>

              <div className="term-item">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">5. Termination of Use</h4>
                <p>MediLens reserves the right to suspend or terminate accounts that violate these terms.</p>
              </div>

              <div className="term-item">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">6. Updates to Terms</h4>
                <p>We may update these Terms of Use at any time. Continued use of MediLens means you accept the updated terms.</p>
              </div>
            </div>
          </div>

          {/* Disclaimer Section */}
          <div className="disclaimer-section border-t border-[var(--glass-border)] pt-6">
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--primary-purple)]" />
              Disclaimer
            </h3>
            
            <div className="disclaimer-content bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl p-4 space-y-3">
              <p className="font-medium text-[var(--text-primary)]">Important Medical Disclaimer:</p>
              <ul className="space-y-2">
                <li>• MediLens is an information and support platform designed to enhance healthcare accessibility.</li>
                <li>• MediLens does not provide medical advice, diagnosis, or treatment.</li>
                <li>• Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.</li>
                <li>• Never disregard or delay seeking professional medical advice because of information provided on MediLens.</li>
                <li>• Use of MediLens is at your own risk, and the platform and its providers are not responsible for any decisions made based on the information provided.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer mt-8 pt-4 border-t border-[var(--glass-border)] text-center">
          <button
            onClick={onClose}
            className="close-button p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)]"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;