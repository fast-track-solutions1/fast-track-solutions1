'use client';

import { Home, Users } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="text-white font-bold">MSI TeamHub</div>
      </div>
      <nav className="p-4 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white p-2 rounded">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <Link href="/employees" className="flex items-center gap-2 text-slate-400 hover:text-white p-2 rounded">
          <Users className="h-4 w-4" />
          Employés
        </Link>
      </nav>
    </aside>
  );
}
