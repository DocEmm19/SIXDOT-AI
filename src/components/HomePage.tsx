import React, { useState } from 'react';
import { LogOut, Brain, Shield, Zap, Upload, Search, MessageSquare, FileText, Activity } from 'lucide-react';
import MedicalLogo from './MedicalLogo';
import { User } from '../App';
import Modal from './Modal';

interface HomePageProps {
  user: User;
  onLogout: () => void;
}

interface Answer {
  id: string;
  question: string;
  response: string;
  timestamp: Date;
}

interface MedicineInfo {
  name: string;
  genericName: string;
  description: string;
  uses: string[];
  sideEffects: string[];
  dosage: string;
  warnings: string[];
  source: string;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [medicineResults, setMedicineResults] = useState<MedicineInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleFeatureClick = (feature: string) => {
    setActiveModal(feature);
  };

  const handleMedicineSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineQuery.trim()) return;

    setIsSearching(true);
    
    // Simulate API call to trusted medical database
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock medicine data - in real implementation, this would come from APIs like:
    // - FDA Orange Book API
    // - RxNorm API
    // - OpenFDA API
    // - Drugs.com API
    const mockResults: MedicineInfo[] = [
      {
        name: medicineQuery,
        genericName: `Generic ${medicineQuery}`,
        description: `${medicineQuery} is a medication used for therapeutic purposes. This information is sourced from trusted medical databases.`,
        uses: [
          'Treatment of specific medical conditions',
          'Prevention of certain symptoms',
          'Management of chronic conditions'
        ],
        sideEffects: [
          'Common: Mild headache, nausea',
          'Uncommon: Dizziness, fatigue',
          'Rare: Allergic reactions'
        ],
        dosage: 'As prescribed by healthcare provider. Typical adult dose: Follow medical guidance.',
        warnings: [
          'Consult healthcare provider before use',
          'Not recommended during pregnancy without medical supervision',
          'May interact with other medications'
        ],
        source: 'FDA Database & Medical Literature'
      }
    ];
    
    setMedicineResults(mockResults);
    setIsSearching(false);
  };

  const handleAskQuestion = (question: string) => {
    // Simulate AI response
    const response = `Based on your query about "${question}", our AI analysis suggests comprehensive evaluation and monitoring. This is a simulated response for demonstration purposes.`;
    
    const newAnswer: Answer = {
      id: Date.now().toString(),
      question,
      response,
      timestamp: new Date()
    };

    setAnswers(prev => [newAnswer, ...prev]);
    setActiveModal(null);
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
          <button
            onClick={onLogout}
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

          {/* Medicine Search Card */}
          <div className="feature-card bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8 transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] relative overflow-hidden hover:transform hover:-translate-y-2 hover:border-[var(--primary-cyan)] hover:shadow-[0_25px_50px_rgba(0,212,170,0.2)]">
            <div className="feature-icon w-[60px] h-[60px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[28px]">
              <Search className="w-7 h-7 text-white" />
            </div>
            <h3 className="feature-title font-['Orbitron'] text-xl font-semibold text-[var(--text-primary)] mb-3 text-center">
              Search Medicine Information
            </h3>
            <p className="feature-description text-[var(--text-secondary)] leading-[1.6] mb-5 text-center">
              Get detailed information about medications from trusted medical databases
            </p>
            
            <form onSubmit={handleMedicineSearch} className="medicine-search-form">
              <div className="search-input-container relative mb-4">
                <input
                  type="text"
                  value={medicineQuery}
                  onChange={(e) => setMedicineQuery(e.target.value)}
                  placeholder="Enter medicine name (e.g., Aspirin, Ibuprofen)"
                  className="medicine-search-input w-full p-4 bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] placeholder:text-[var(--text-muted)]"
                  disabled={isSearching}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[var(--primary-cyan)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!medicineQuery.trim() || isSearching}
                className="feature-button w-full p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSearching ? 'Searching...' : 'Search Medicine'}
              </button>
            </form>
          </div>

          <div
            className="feature-card bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8 text-center transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] cursor-pointer relative overflow-hidden hover:transform hover:-translate-y-2 hover:border-[var(--primary-cyan)] hover:shadow-[0_25px_50px_rgba(0,212,170,0.2)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(0,212,170,0.1)] before:to-transparent before:transition-[left_0.6s_ease] hover:before:left-full"
            onClick={() => handleFeatureClick('question')}
          >
            <div className="feature-icon w-[60px] h-[60px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[28px]">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <h3 className="feature-title font-['Orbitron'] text-xl font-semibold text-[var(--text-primary)] mb-3">
              Ask Questions
            </h3>
            <p className="feature-description text-[var(--text-secondary)] leading-[1.6] mb-5">
              Get instant answers about medications and health
            </p>
            <div className="question-examples text-left mb-5">
              <p className="text-[var(--text-secondary)] text-sm mb-2">Try asking:</p>
              <p className="text-[var(--text-muted)] text-sm italic">"What are the side effects of ibuprofen?"</p>
            </div>
            <button className="feature-button p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)]">
              Ask Question
            </button>
          </div>
        </div>

        {/* Medicine Search Results */}
        {medicineResults.length > 0 && (
          <div className="medicine-results-section bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8 mb-[50px]">
            <div className="results-header text-center mb-8">
              <h2 className="results-title font-['Orbitron'] text-[1.8rem] font-semibold text-[var(--text-primary)] mb-2">
                Medicine Information
              </h2>
              <p className="results-subtitle text-[var(--text-secondary)]">
                Detailed information from trusted medical databases
              </p>
            </div>

            {medicineResults.map((medicine, index) => (
              <div key={index} className="medicine-card bg-[rgba(255,255,255,0.05)] rounded-xl p-6 mb-4">
                <div className="medicine-header mb-4">
                  <h3 className="medicine-name font-['Orbitron'] text-xl font-semibold text-[var(--text-primary)] mb-1">
                    {medicine.name}
                  </h3>
                  <p className="generic-name text-[var(--text-secondary)] text-sm">
                    Generic: {medicine.genericName}
                  </p>
                </div>

                <div className="medicine-details grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="description-section">
                    <h4 className="section-title font-semibold text-[var(--text-primary)] mb-2">Description</h4>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{medicine.description}</p>
                  </div>

                  <div className="uses-section">
                    <h4 className="section-title font-semibold text-[var(--text-primary)] mb-2">Common Uses</h4>
                    <ul className="text-[var(--text-secondary)] text-sm space-y-1">
                      {medicine.uses.map((use, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-2 h-2 bg-[var(--primary-cyan)] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {use}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="dosage-section">
                    <h4 className="section-title font-semibold text-[var(--text-primary)] mb-2">Dosage</h4>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{medicine.dosage}</p>
                  </div>

                  <div className="side-effects-section">
                    <h4 className="section-title font-semibold text-[var(--text-primary)] mb-2">Side Effects</h4>
                    <ul className="text-[var(--text-secondary)] text-sm space-y-1">
                      {medicine.sideEffects.map((effect, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="warnings-section mt-6 p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg">
                  <h4 className="section-title font-semibold text-red-400 mb-2">Important Warnings</h4>
                  <ul className="text-red-300 text-sm space-y-1">
                    {medicine.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="source-section mt-4 text-center">
                  <p className="text-[var(--primary-cyan)] text-xs">
                    Source: {medicine.source}
                  </p>
                  <p className="text-[var(--text-muted)] text-xs mt-1">
                    This information is for educational purposes only. Always consult with a healthcare provider.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Answers Section */}
        <div className="answers-section bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8">
          <div className="answers-header text-center mb-8">
            <h2 className="answers-title font-['Orbitron'] text-[1.8rem] font-semibold text-[var(--text-primary)] mb-2">
              Recent Questions & Answers
            </h2>
            <p className="answers-subtitle text-[var(--text-secondary)]">
              Your latest health and medication questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;