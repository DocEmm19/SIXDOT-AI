import React, { useState } from 'react';
import { useEffect } from 'react';
import BackgroundAnimation from './components/BackgroundAnimation';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase, getCurrentUser, getProfile } from './lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getProfile(user.id);
          if (profile) {
            setCurrentUser({
              id: profile.id,
              email: profile.email,
              name: profile.name
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await getProfile(session.user.id);
          if (profile) {
            setCurrentUser({
              id: profile.id,
              email: profile.email,
              name: profile.name
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen relative flex items-center justify-center">
          <BackgroundAnimation />
          <div className="text-center">
            <div className="loading w-8 h-8 border-2 border-[var(--text-muted)] border-t-[var(--primary-cyan)] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

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