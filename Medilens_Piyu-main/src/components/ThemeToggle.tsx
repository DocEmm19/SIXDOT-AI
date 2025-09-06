import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle p-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[var(--text-secondary)] cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--text-primary)] hover:border-[var(--primary-cyan)] hover:shadow-[0_4px_12px_var(--card-hover-shadow)] relative overflow-hidden group"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative z-10 flex items-center justify-center w-5 h-5">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
        ) : (
          <Sun className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
        )}
      </div>
      
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 -translate-x-full transition-all duration-500 group-hover:translate-x-full group-hover:opacity-20"></div>
    </button>
  );
};

export default ThemeToggle;