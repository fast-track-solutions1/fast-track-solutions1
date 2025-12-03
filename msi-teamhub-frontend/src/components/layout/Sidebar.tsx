'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard' },
  { icon: Building2, label: 'Sociétés', href: '/admin/societes' },
  { icon: Users, label: 'Départements', href: '/admin/departements' },
  { icon: Briefcase, label: 'Services', href: '/admin/services' },
  { icon: GraduationCap, label: 'Grades & Postes', href: '/admin/grades' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 bottom-0 bg-slate-900 text-white border-r border-slate-800">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-900/20">
          <span className="font-bold text-lg text-white">M</span>
        </div>
        <span className="font-bold text-lg tracking-tight">MSI TeamHub</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Principal
        </div>
        
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("h-5 w-5 mr-3", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {item.label}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
            </Link>
          );
        })}

        <div className="mt-8 px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Système
        </div>
        <Link
          href="/settings"
          className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5 mr-3 text-slate-400" />
          Paramètres
        </Link>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
            AD
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Administrateur</p>
            <p className="text-xs text-slate-400 truncate">admin@msi.com</p>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
