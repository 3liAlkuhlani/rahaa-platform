import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ variant = 'icon', className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-cairo text-xs font-bold transition-all ${className}`}
      >
        <button
          type="button"
          onClick={() => !isDark || toggleTheme()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            !isDark
              ? 'bg-white text-rahaa-navy shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>نهاري (فاتح)</span>
        </button>

        <button
          type="button"
          onClick={() => isDark || toggleTheme()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            isDark
              ? 'bg-slate-900 text-sky-400 shadow-sm border border-slate-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-sky-400" />
          <span>ليلي (داكن)</span>
        </button>
      </div>
    );
  }

  // Default 'icon' button for Headers
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`h-10 w-10 rounded-xl border border-rahaa-border text-rahaa-text-muted hover:text-rahaa-blue hover:bg-rahaa-bg dark:hover:bg-slate-800 flex items-center justify-center transition-all duration-300 relative group overflow-hidden ${className}`}
      title={isDark ? 'التبديل إلى الوضع النهاري (الفاتح)' : 'التبديل إلى الوضع الليلي (الداكن)'}
      aria-label="تبديل الثيم"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 group-hover:text-rahaa-primary transition-transform duration-300 -rotate-12 group-hover:rotate-0" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;

