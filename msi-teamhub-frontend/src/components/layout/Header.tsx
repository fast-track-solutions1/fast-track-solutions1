'use client';

import { ThemeToggle } from './ThemeToggle';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm">
      {/* Left: Search */}
      <div className="flex items-center w-1/3">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher (Ctrl+K)..."
            className="pl-9 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-blue-500 w-full rounded-xl"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-background"></span>
        </Button>
        
        <div className="h-6 w-px bg-border mx-1"></div>
        
        <ThemeToggle />
      </div>
    </header>
  );
}
