'use client';

import React from 'react';
import { Search, Bell, Sun, Moon, User } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface HeaderProps {
  darkMode: boolean;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onThemeToggle,
}) => {
  return (
    <header className={clsx(
      'h-16 border-b transition-colors duration-300 flex items-center justify-between px-6',
      darkMode
        ? 'bg-gray-900 border-gray-800'
        : 'bg-white border-gray-200'
    )}>
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      {/* Left Section - Search */}
      <div className="flex-1 max-w-md">
        <div className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-100 border-gray-300'
        )}>
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            className={clsx(
              'bg-transparent outline-none w-full text-sm',
              darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-600'
            )}
          />
        </div>
      </div>

      {/* Right Section - Icons */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={clsx(
            'p-2 rounded-lg transition-colors relative',
            darkMode
              ? 'hover:bg-gray-800'
              : 'hover:bg-gray-100'
          )}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onThemeToggle}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-gray-100 hover:bg-gray-200'
          )}
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </motion.button>

        {/* User Profile */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
            darkMode
              ? 'hover:bg-gray-800'
              : 'hover:bg-gray-100'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
            AH
          </div>
          <User className="w-5 h-5" />
        </motion.button>
      </div>
    </header>
  );
};
