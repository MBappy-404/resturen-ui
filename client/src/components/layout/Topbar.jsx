import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';

const Topbar = ({ onMenuClick, title }) => {
  const { theme, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 xl:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
            <Menu size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          {showSearch && (
            <input
              type="text"
              placeholder="Search anything..."
              className="input-field w-48 lg:w-64 text-sm !py-2 !rounded-xl"
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          )}
          <button onClick={() => setShowSearch(!showSearch)} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
            <Search size={18} className="text-slate-400" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 relative">
            <Bell size={18} className="text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>
          <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
            {theme === 'light' ? <Moon size={18} className="text-slate-400" /> : <Sun size={18} className="text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
