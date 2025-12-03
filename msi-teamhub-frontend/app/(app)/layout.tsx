'use client';

import { useState, useEffect } from 'react';
import { Home, Users, FileText, GitBranch, Monitor, Briefcase, Award, Settings, ChevronDown, Menu, X, LogOut, Sun, Moon, Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainMenu = [
  { label: 'Tableau de bord', href: '/dashboard', icon: Home },
  { label: 'Salariés', href: '/employees', icon: Users },
  { label: 'Fiches de poste', href: '/job-descriptions', icon: FileText },
  { label: 'Organigramme', href: '/org-chart', icon: GitBranch },
  { label: 'Gestion des équipements', href: '/equipment', icon: Monitor },
  { label: 'Services', href: '/services', icon: Briefcase },
  { label: 'Grades', href: '/grades', icon: Award },
];

const settingsMenu = [
  { label: 'Paramètres sociétés', href: '/settings/companies' },
  { label: 'Paramètres grades', href: '/settings/grades' },
  { label: 'Paramètres services', href: '/settings/services' },
  { label: 'Paramètres départements', href: '/settings/departments' },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const isActive = (href: string) => pathname === href;

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-white';
  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const sidebarBg = darkMode ? 'bg-slate-900/95' : 'bg-slate-50';
  const headerBg = darkMode ? 'bg-slate-900/50' : 'bg-white';
  const inputBg = darkMode ? 'bg-slate-800/50' : 'bg-slate-100';
  const inputBorder = darkMode ? 'border-slate-700' : 'border-slate-200';
  const hoverBg = darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100';
  const activeBg = darkMode ? 'bg-blue-600/20' : 'bg-blue-50';
  const activeText = darkMode ? 'text-blue-400' : 'text-blue-600';
  const borderColor = darkMode ? 'border-slate-800' : 'border-slate-200';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const inputText = darkMode ? 'text-slate-200' : 'text-slate-900';
  const inputPlaceholder = darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400';

  if (!mounted) return null;

  return (
    <div className={`flex h-screen ${bgClass} overflow-hidden transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} ${sidebarBg} border-r ${borderColor} flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className={`p-6 border-b ${borderColor} flex items-center gap-3`}>
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-lg font-black text-white">M</span>
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">MSI</div>
              <div className={`text-xs font-bold ${textSecondary}`}>TeamHub</div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {mainMenu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  active 
                    ? `${activeBg} ${activeText} border ${borderColor}` 
                    : `${textSecondary} ${hoverBg}`
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}

          {/* Settings */}
          <div className={`pt-6 border-t ${borderColor} mt-6`}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`flex items-center justify-between w-full px-4 py-2.5 ${textSecondary} ${hoverBg} rounded-lg transition-all`}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">Paramètres</span>}
              </div>
              {sidebarOpen && <ChevronDown className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />}
            </button>

            {settingsOpen && sidebarOpen && (
              <div className={`ml-4 mt-2 space-y-1 border-l-2 ${borderColor} pl-3`}>
                {settingsMenu.map((item) => (
                  <Link key={item.href} href={item.href} className={`block ${textSecondary} hover:text-blue-500 text-sm p-2 rounded`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className={`p-4 border-t ${borderColor}`}>
          <button className={`flex items-center gap-3 w-full px-4 py-2.5 ${textSecondary} hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all`}>
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`border-b ${borderColor} ${headerBg} backdrop-blur-xl transition-colors duration-300`}>
          <div className="flex items-center justify-between px-6 py-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 ${hoverBg} rounded-lg transition-colors`}>
              {sidebarOpen ? <X className={`h-5 w-5 ${textSecondary}`} /> : <Menu className={`h-5 w-5 ${textSecondary}`} />}
            </button>
            
            <div className="flex-1 max-w-md ml-4">
              <div className="relative">
                <Search className={`absolute left-3 top-3 h-4 w-4 ${textSecondary}`} />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className={`w-full pl-10 pr-4 py-2 rounded-lg ${inputBg} border ${inputBorder} text-sm ${inputText} ${inputPlaceholder} transition-colors`}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
              <button className={`p-2 ${textSecondary} hover:text-blue-500 transition-colors`}>
                <Bell className="h-5 w-5" />
              </button>
              <button className={`p-2 ${textSecondary} hover:text-blue-500 transition-colors`}>
                ⚙️
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${hoverBg} rounded-lg transition-all`}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-400" />
                )}
              </button>
              
              <button className={`p-2 ${textSecondary} hover:text-blue-500 transition-colors`}>
                👤
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-y-auto ${bgClass} ${textClass} transition-colors duration-300`}>
          {children}
        </main>
      </div>
    </div>
  );
}
