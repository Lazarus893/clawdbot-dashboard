import { useUI } from '../hooks/useUI';
import { Moon, Sun } from '@phosphor-icons/react';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useUI();

  return (
    <button
      onClick={toggleTheme}
      className="relative touch-target p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`absolute inset-0 w-4 h-4 text-amber-400 transition-all duration-300 ${isDarkMode ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'}`}
        />
        <Moon
          className={`absolute inset-0 w-4 h-4 text-blue-400 transition-all duration-300 ${isDarkMode ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-0'}`}
        />
      </div>
    </button>
  );
}
