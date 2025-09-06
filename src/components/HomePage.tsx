import React, { useState } from 'react';
import { useEffect } from 'react';
import { LogOut, Brain, Shield, Zap, Upload, Search, MessageSquare, FileText, Activity } from 'lucide-react';
import MedicalLogo from './MedicalLogo';
import { User } from '../App';
import Modal from './Modal';
import ThemeToggle from './ThemeToggle';
import { signOut, createConsultation, getConsultations, Consultation } from '../lib/supabase';

interface HomePageProps {
  user: User;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout }) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, [user.id]);

  const loadConsultations = async () => {
    try {
      const data = await getConsultations(user.id);
      setConsultations(data);
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureClick = (feature: string) => {
    setActiveModal(feature);
  };

  const handleAskQuestion = async (question: string) => {
    try {
      // Simulate AI response
      const response = `Based on your query about "${question}", our AI analysis suggests comprehensive evaluation and monitoring. This is a simulated response for demonstration purposes.`;
      
      const consultation = await createConsultation({
        user_id: user.id,
        question,
        response,
        type: 'question'
      });

      setConsultations(prev => [consultation, ...prev]);
      setActiveModal(null);
    } catch (error) {
      console.error('Error creating consultation:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback: still call onLogout even if Supabase signout fails
      onLogout();
    }
  };

  return (
    <div className="home-page">
      {/* Header */}
      <div className="header bg-[var(--glass-bg)] backdrop-blur-[30px] border-b border-[var(--glass-border)] p-[20px_40px] flex justify-between items-center sticky top-0 z-[100]">
        <div className="header-left flex items-center gap-4">
          <MedicalLogo size={50} />
          <h1 className="header-title font-['Orbitron'] text-[var(--text-primary)] text-2xl font-semibold">
            MediLens
          </h1>
        </div>
        <div className="header-right flex items-center gap-4">
          <div className="user-info text-[var(--text-secondary)] text-sm">
            Welcome, {user.name}
          </div>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="logout-btn p-[8px_16px] bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-lg text-[var(--text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content p-10 max-w-[1200px] mx-auto">
        <div className="welcome-section text-center mb-[50px]">
          <h1 className="welcome-title font-['Orbitron'] text-[2.5rem] font-semibold text-[var(--text-primary)] mb-3">
            Healthcare AI Dashboard
          </h1>
          <p className="welcome-subtitle text-[var(--text-secondary)] text-lg max-w-[600px] mx-auto">
            Leverage advanced AI technology to enhance patient care and medical decision-making
          </p>
        </div>

        {/* Feature Cards */}
        <div className="features-grid grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 mb-[50px]">
          <div
            className="feature-card bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8 text-center transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] cursor-pointer relative overflow-hidden hover:transform hover:-translate-y-2 hover:border-[var(--primary-cyan)] hover:shadow-[0_25px_50px_rgba(0,212,170,0.2)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(0,212,170,0.1)] before:to-transparent before:transition-[left_0.6s_ease] hover:before:left-full"
            onClick={() => handleFeatureClick('upload')}
          >
            <div className="feature-icon w-[60px] h-[60px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[28px]">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <h3 className="feature-title font-['Orbitron'] text-xl font-semibold text-[var(--text-primary)] mb-3">
              Medical File Upload
            </h3>
            <p className="feature-description text-[var(--text-secondary)] leading-[1.6] mb-5">
              Securely upload and analyze medical documents, lab results, and imaging files with AI-powered insights
            </p>
            <button className="feature-button p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)]">
              Upload Files
            </button>
          </div>

          <div
            className="feature-card bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8 text-center transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] cursor-pointer relative overflow-hidden hover:transform hover:-translate-y-2 hover:border-[var(--primary-cyan)] hover:shadow-[0_25px_50px_rgba(0,212,170,0.2)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(0,212,170,0.1)] before:to-transparent before:transition-[left_0.6s_ease] hover:before:left-full"
            onClick={() => handleFeatureClick('search')}
          >
            <div className="feature-icon w-[60px] h-[60px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[28px]">
              <Search className="w-7 h-7 text-white" />
            </div>
            <h3 className="feature-title font-['Orbitron'] text-xl font-semibold text-[var(--text-primary)] mb-3">
              Medical Research
            </h3>
            <p className="feature-description text-[var(--text-secondary)] leading-[1.6] mb-5">
              Access comprehensive medical databases and research papers with intelligent search capabilities
            </p>
            <button className="feature-button p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)]">
              Search Database
            </button>
          </div>

          <div
            className="feature-card bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8 text-center transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] cursor-pointer relative overflow-hidden hover:transform hover:-translate-y-2 hover:border-[var(--primary-cyan)] hover:shadow-[0_25px_50px_rgba(0,212,170,0.2)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(0,212,170,0.1)] before:to-transparent before:transition-[left_0.6s_ease] hover:before:left-full"
            onClick={() => handleFeatureClick('question')}
          >
            <div className="feature-icon w-[60px] h-[60px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[28px]">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <h3 className="feature-title font-['Orbitron'] text-xl font-semibold text-[var(--text-primary)] mb-3">
              AI Consultation
            </h3>
            <p className="feature-description text-[var(--text-secondary)] leading-[1.6] mb-5">
              Get instant AI-powered medical insights and recommendations for complex cases
            </p>
            <button className="feature-button p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)]">
              Ask AI
            </button>
          </div>
        </div>

        {/* Answers Section */}
        <div className="answers-section bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8">
          <div className="answers-header text-center mb-8">
            <h2 className="answers-title font-['Orbitron'] text-[1.8rem] font-semibold text-[var(--text-primary)] mb-2">
              Recent AI Consultations
            </h2>
            <p className="answers-subtitle text-[var(--text-secondary)]">
              Your latest medical AI interactions and insights
            </p>
          </div>

          <div className="answers-content max-h-[400px] overflow-y-auto py-5">
            {loading ? (
              <div className="text-center p-10">
                <div className="loading w-6 h-6 border-2 border-[var(--text-muted)] border-t-[var(--primary-cyan)] rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-[var(--text-muted)] text-sm">Loading consultations...</p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="no-consultations text-center text-[var(--text-muted)] italic p-10">
                No consultations yet. Start by asking the AI a medical question or uploading files for analysis.
              </div>
            ) : (
              consultations.map((consultation) => (
                <div key={consultation.id} className="consultation-item bg-[rgba(255,255,255,0.05)] rounded-xl p-5 mb-4 border-l-4 border-[var(--primary-cyan)]">
                  <div className="answer-question font-semibold text-[var(--text-primary)] mb-2">
                    Q: {consultation.question}
                  </div>
                  <div className="answer-response text-[var(--text-secondary)] leading-[1.6]">
                    A: {consultation.response}
                  </div>
                  <div className="answer-time text-xs text-[var(--text-muted)] mt-2">
                    {new Date(consultation.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'upload'}
        onClose={() => setActiveModal(null)}
        title="Upload Medical Files"
        type="upload"
      />

      <Modal
        isOpen={activeModal === 'search'}
        onClose={() => setActiveModal(null)}
        title="Medical Research Database"
        type="search"
      />

      <Modal
        isOpen={activeModal === 'question'}
        onClose={() => setActiveModal(null)}
        title="AI Medical Consultation"
        type="question"
        onSubmit={handleAskQuestion}
      />
    </div>
  );
};

export default HomePage;