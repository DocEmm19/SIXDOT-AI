import React, { useState } from 'react';
import BackgroundAnimation from './components/BackgroundAnimation';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import ChatbotPage from './components/ChatbotPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { signOutUser, getCurrentUser } from './lib/supabase';

export interface User {
  email: string;
  name: string;
  id: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'chatbot'>('auth');
  const [chatbotContext, setChatbotContext] = useState<'upload' | 'medicine-search' | 'question'>('question');
  const [chatSessionId, setChatSessionId] = useState<string | undefined>(undefined);

  // Check for existing Supabase session on app load
  React.useEffect(() => {
    const checkAuthSession = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser({
          email: user.email || '',
          name: user.user_metadata?.name || 'User',
          id: user.id
        });
        setCurrentPage('home');
      }
    };

    checkAuthSession();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setCurrentPage('auth');
  };

  const handleNavigateToChatbot = (context: 'upload' | 'medicine-search' | 'question') => {
    setChatbotContext(context);
    setChatSessionId(undefined); // Start new session
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
            sessionId={chatSessionId}
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