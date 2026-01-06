'use client';

import React from 'react';
import SidebarNew from './components/SidebarNew';
import { Header } from './components/Header';
import { useTheme } from './hooks/useTheme';
import clsx from 'clsx';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { darkMode, toggle: toggleTheme, mounted } = useTheme();

  if (!mounted) return null;

  return (
    <div
      className={clsx(
        'flex h-screen w-screen overflow-hidden transition-colors duration-300',
        darkMode ? 'bg-slate-950' : 'bg-slate-50'
      )}
    >
      {/* Nouveau Sidebar avec permissions */}
      <SidebarNew />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full h-full">
        {/* Header */}
        <Header
          darkMode={darkMode}
          onThemeToggle={toggleTheme}
        />

        {/* Content - avec scroll smooth */}
        <main
          className={clsx(
            'flex-1 overflow-y-auto transition-colors duration-300 w-full',
            'scroll-smooth',
            darkMode ? 'bg-slate-950' : 'bg-slate-50'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
