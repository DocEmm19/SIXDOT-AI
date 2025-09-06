import React, { useState } from 'react';
import BackgroundAnimation from './components/BackgroundAnimation';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import ChatbotPage from './components/ChatbotPage';
import { ThemeProvider } from './contexts/ThemeContext';

export interface User {
  email: string;
  name: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'chatbot'>('auth');
  const [chatbotContext, setChatbotContext] = useState<'upload' | 'medicine-search' | 'question'>('question');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('auth');
  };

  const handleNavigateToChatbot = (context: 'upload' | 'medicine-search' | 'question') => {
    setChatbotContext(context);
    setCurrentPage('chatbot');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen relative">
        <BackgroundAnimation />
        
        {currentPage === 'chatbot' && currentUser ? (
          <ChatbotPage 
            user={currentUser} 
            onBack={handleBackToHome}
            initialContext={chatbotContext}
          />
        ) : currentUser && currentPage === 'home' ? (
          <HomePage user={currentUser} onLogout={handleLogout} onNavigateToChatbot={handleNavigateToChatbot} />
        ) : (
          <AuthPage onLogin={handleLogin} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;