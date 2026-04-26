import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';

const Topbar = ({ onMenuClick, title }) => {
  const { theme, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <input
              type="text"
              placeholder="Search..."
              className="input-field w-48 lg:w-64 text-sm"
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          )}
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Search size={18} className="text-gray-500" />
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === 'light' ? <Moon size={18} className="text-gray-500" /> : <Sun size={18} className="text-yellow-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
