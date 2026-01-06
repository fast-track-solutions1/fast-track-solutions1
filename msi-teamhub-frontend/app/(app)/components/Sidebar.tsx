'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem, MenuProvider } from './MenuItem';
import { MENU_ITEMS } from '../constants/menuItems';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  darkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, darkMode }) => {
  const pathname = usePathname();

  return (
    <motion.div
      initial={false}
      animate={{
        width: isOpen ? 280 : 80,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={clsx(
        'h-screen flex flex-col border-r shadow-xl transition-colors duration-300',
        darkMode
          ? 'bg-slate-900 border-slate-700'
          : 'bg-white border-slate-200'
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          'flex items-center justify-between px-4 py-5 border-b',
          darkMode ? 'border-slate-700' : 'border-slate-200'
        )}
      >
        {isOpen && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={clsx(
              'text-xl font-bold',
              darkMode ? 'text-white' : 'text-slate-900'
            )}
          >
            MSI TeamHub
          </motion.h1>
        )}
        <button
          onClick={onToggle}
          className={clsx(
            'p-2 rounded-lg transition-colors duration-200',
            darkMode
              ? 'hover:bg-slate-800 text-slate-300'
              : 'hover:bg-slate-100 text-slate-600'
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <motion.nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-2">
        <MenuProvider>
          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              pathname={pathname}
              darkMode={darkMode}
              isOpen={isOpen}
              level={0}
            />
          ))}
        </MenuProvider>
      </motion.nav>

      {/* Footer - Logout */}
      <motion.div
        className={clsx(
          'p-3 border-t',
          darkMode ? 'border-slate-700' : 'border-slate-200'
        )}
      >
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={clsx(
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150',
            'group border shadow-sm',
            darkMode
              ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300 border-slate-700/20 hover:border-red-500/30'
              : 'text-red-600 hover:bg-red-50 hover:text-red-700 border-slate-200 hover:border-red-300'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
          {isOpen && <span className="text-sm font-semibold">Déconnexion</span>}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
