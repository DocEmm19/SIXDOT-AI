import React, { useState } from 'react';
import BackgroundAnimation from './components/BackgroundAnimation';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import ChatBotPage from './components/ChatBotPage';
import { ThemeProvider } from './contexts/ThemeContext';

export interface User {
  email: string;
  name: string;
}

type AppPage = 'auth' | 'home' | 'chatbot';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<AppPage>('auth');
  const [chatbotFeature, setChatbotFeature] = useState<'upload' | 'search' | 'question'>('question');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('auth');
  };

  const handleFeatureClick = (feature: 'upload' | 'search' | 'question') => {
    setChatbotFeature(feature);
    setCurrentPage('chatbot');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen relative">
        <BackgroundAnimation />
        
        {currentPage === 'auth' && (
          <AuthPage onLogin={handleLogin} />
        )}
        
        {currentPage === 'home' && currentUser && (
          <HomePage 
            user={currentUser} 
            onLogout={handleLogout}
            onFeatureClick={handleFeatureClick}
          />
        )}
        
        {currentPage === 'chatbot' && currentUser && (
          <ChatBotPage 
            user={currentUser}
            onBack={handleBackToHome}
            initialFeature={chatbotFeature}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;