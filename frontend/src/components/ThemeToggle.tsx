import { useUI } from '../hooks/useUI';
import { Moon, Sun } from '@phosphor-icons/react';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useUI();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl glass-card hover:border-orange-500/30 transition-all duration-300 group"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 text-amber-400 transition-all duration-500
            ${isDarkMode ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'}
          `}
        />
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-500
            ${isDarkMode ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-0'}
          `}
        />
      </div>
      
      {/* Glow effect */}
      <div 
        className={`
          absolute inset-0 rounded-xl blur-md -z-10 transition-opacity duration-300
          ${isDarkMode ? 'bg-blue-500/30 opacity-0 group-hover:opacity-100' : 'bg-amber-500/30 opacity-0 group-hover:opacity-100'}
        `}
      />
    </button>
  );
}
