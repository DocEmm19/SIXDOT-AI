import React, { useState } from 'react';
import { LogOut, Brain, Shield, Zap, Upload, Search, MessageSquare, FileText, Activity } from 'lucide-react';
import MedicalLogo from './MedicalLogo';
import { User } from '../App';
import Modal from './Modal';
import ThemeToggle from './ThemeToggle';
import InteractiveTutorial from './InteractiveTutorial';
import WelcomeModal from './WelcomeModal';
import { getChatSessions, getChatMessages, ChatSession, ChatMessage } from '../lib/supabase';

interface HomePageProps {
  user: User;
  onLogout: () => void;
  onNavigateToChatbot: (context: 'upload' | 'medicine-search' | 'question') => void;
  onNavigateToChatbotWithText?: (context: 'upload' | 'medicine-search' | 'question', extractedText: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout, onNavigateToChatbot, onNavigateToChatbotWithText }) => {
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [latestSession, setLatestSession] = useState<ChatSession | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'upload' | 'medicine-search' | 'question'>('upload');
  const [modalTitle, setModalTitle] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [welcomeSkipped, setWelcomeSkipped] = useState(false);

  // Load recent chat messages
  React.useEffect(() => {
    const loadRecentMessages = async () => {
      try {
        const sessions = await getChatSessions();
        if (sessions.length > 0) {
          const latestSession = sessions[0]; // Most recent session
          setLatestSession(latestSession);
          
          const messages = await getChatMessages(latestSession.id);
          // Get last 4 messages (2 pairs of user-bot interactions)
          const recentMessages = messages.slice(-4);
          setRecentMessages(recentMessages);
        }
      } catch (error) {
        console.error('Error loading recent messages:', error);
      }
    };

    loadRecentMessages();
  }, []);

  const handleFeatureClick = (feature: string) => {
    if (feature === 'upload') {
      setModalType('upload');
      setModalTitle('Upload Your Doctor\'s Prescription');
      setModalOpen(true);
    } else if (feature === 'medicine-search') {
      onNavigateToChatbot('medicine-search');
    } else if (feature === 'question') {
      onNavigateToChatbot('question');
    }
  };

  const handleAddAnswer = (extractedText: string) => {
    // Navigate to chatbot with extracted text
    if (onNavigateToChatbotWithText) {
      onNavigateToChatbotWithText('upload', extractedText);
    }
    setModalOpen(false);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('medilens-tutorial-completed', 'true');
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem('medilens-tutorial-completed', 'true');
  };

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
  };

  const handleWelcomeSkip = () => {
    setShowWelcomeModal(false);
    setWelcomeSkipped(true);
    sessionStorage.setItem('medilens-welcome-skipped', 'true');
  };

  // Check if tutorial was previously completed
  React.useEffect(() => {
    const tutorialCompleted = localStorage.getItem('medilens-tutorial-completed');
    const welcomeSkippedSession = sessionStorage.getItem('medilens-welcome-skipped');
    
    if (tutorialCompleted === 'true') {
      setShowTutorial(false);
    }
    
    if (welcomeSkippedSession === 'true') {
      setShowWelcomeModal(false);
      setWelcomeSkipped(true);
    }
  }, []);

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
        <div id="user-profile-section" className="header-right flex items-center gap-4">
          <div className="user-info text-[var(--text-secondary)] text-sm">
            Welcome, {user.name}
          </div>
          <ThemeToggle />
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
            id="prescription-upload-button"
            className="feature-card bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8 text-center transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] cursor-pointer relative overflow-hidden hover:transform hover:-translate-y-2 hover:border-[var(--primary-cyan)] hover:shadow-[0_25px_50px_rgba(0,212,170,0.2)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(0,212,170,0.1)] before:to-transparent before:transition-[left_0.6s_ease] hover:before:left-full"
            onClick={() => handleFeatureClick('upload')}
          >
            <div className="feature-icon w-[60px] h-[60px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[28px]">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <h3 className="feature-title font-['Orbitron'] text-xl font-semibold text-[var(--text-primary)] mb-3">
              Upload Your Doctor's Prescription
            </h3>
            <p className="feature-description text-[var(--text-secondary)] leading-[1.6] mb-5">
              Securely upload your doctor's prescription and get AI-powered insights and analysis
            </p>
            <button className="feature-button p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)]">
              Start Analysis
            </button>
          </div>

          <div
            id="medicine-search-button"
            className="feature-card bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8 text-center transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] cursor-pointer relative overflow-hidden hover:transform hover:-translate-y-2 hover:border-[var(--primary-cyan)] hover:shadow-[0_25px_50px_rgba(0,212,170,0.2)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(0,212,170,0.1)] before:to-transparent before:transition-[left_0.6s_ease] hover:before:left-full"
            onClick={() => handleFeatureClick('medicine-search')}
          >
            <div className="feature-icon w-[60px] h-[60px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[28px]">
              <Search className="w-7 h-7 text-white" />
            </div>
            <h3 className="feature-title font-['Orbitron'] text-xl font-semibold text-[var(--text-primary)] mb-3">
              Search Medicine Information
            </h3>
            <p className="feature-description text-[var(--text-secondary)] leading-[1.6] mb-5">
              Search for detailed medicine information including usage, dosage, side effects, and interactions from trusted medical databases
            </p>
            <button className="feature-button p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)]">
              Search Now
            </button>
          </div>

          <div
            id="ai-consultation-button"
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
            <button className="feature-button p-[12px_24px] bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,212,170,0.3)]">
              Ask Now
            </button>
          </div>
        </div>

        {/* Answers Section */}
        <div id="answers-section" className="answers-section bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[20px] p-8">
          <div className="answers-header text-center mb-8">
            <h2 className="answers-title font-['Orbitron'] text-[1.8rem] font-semibold text-[var(--text-primary)] mb-2">
              Recent Questions & Answers
            </h2>
            <p className="answers-subtitle text-[var(--text-secondary)]">
              {latestSession ? `From your latest chat: ${latestSession.title}` : 'Your latest health and medication questions'}
            </p>
          </div>

          <div className="answers-content max-h-[400px] overflow-y-auto py-5">
            {recentMessages.length === 0 ? (
              <div className="no-answers text-center text-[var(--text-muted)] italic p-10">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">No recent conversations yet</p>
                <p className="text-xs">Start by uploading a prescription or asking a health question</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`message-item rounded-xl p-4 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white ml-8' 
                        : 'bg-[rgba(255,255,255,0.05)] border-l-4 border-[var(--primary-cyan)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="message-header flex items-center gap-2 mb-2">
                      {message.type === 'user' ? (
                        <>
                          <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">You</span>
                          </div>
                          <span className="text-sm font-medium opacity-90">Question</span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] rounded-full flex items-center justify-center">
                            <Brain className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-[var(--text-primary)]">MediLens AI</span>
                        </>
                      )}
                      <span className="text-xs opacity-60 ml-auto">
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className={`message-content leading-relaxed ${
                      message.type === 'user' ? 'text-white' : 'text-[var(--text-secondary)]'
                    }`}>
                      {message.content.length > 200 
                        ? `${message.content.substring(0, 200)}...` 
                        : message.content
                      }
                    </div>
                  </div>
                ))}
                
                {latestSession && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => onNavigateToChatbot(latestSession.context as 'upload' | 'medicine-search' | 'question')}
                      className="view-full-chat-btn px-4 py-2 bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.15)] transition-all duration-200 text-sm"
                    >
                      View Full Conversation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        type={modalType}
        onSubmit={handleAddAnswer}
        userEmail={user.email}
      />

      {/* Interactive Tutorial */}
      {!showWelcomeModal && (
        <InteractiveTutorial
          isVisible={showTutorial}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeClose}
        onSkip={handleWelcomeSkip}
        userName={user.name}
      />
    </div>
  );
};

export default HomePage;