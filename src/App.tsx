import React, { useState } from 'react';
import BackgroundAnimation from './components/BackgroundAnimation';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import { ThemeProvider } from './contexts/ThemeContext';

export interface User {
  email: string;
  name: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen relative">
        <BackgroundAnimation />
        
        {currentUser ? (
          <HomePage user={currentUser} onLogout={handleLogout} />
        ) : (
          <AuthPage onLogin={handleLogin} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;