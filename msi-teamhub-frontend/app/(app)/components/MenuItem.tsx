'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { createContext, useContext } from 'react';

interface MenuContextType {
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}

const MenuContext = createContext<MenuContextType | null>(null);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <MenuContext.Provider value={{ expandedId, setExpandedId }}>
      {children}
    </MenuContext.Provider>
  );
};

const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('MenuProvider required');
  return context;
};

interface MenuItemProps {
  item: { id: string; label: string; href?: string; icon: React.ComponentType<any>; submenu?: any[] };
  isOpen: boolean;
  pathname: string;
  darkMode: boolean;
  level?: number;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, isOpen, pathname, darkMode, level = 0 }) => {
  const { expandedId, setExpandedId } = useMenuContext();
  const expanded = expandedId === item.id;
  const Icon = item.icon;
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isActive = pathname === item.href;
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (expanded && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expanded]);

  if (!hasSubmenu) {
    return (
      <Link href={item.href || '#'}>
        <motion.div
          ref={ref}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ x: 4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 cursor-pointer',
            isActive
              ? darkMode
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-md'
              : darkMode
              ? 'border-slate-700/50 text-slate-400 hover:border-emerald-500/40 hover:bg-slate-800/40 hover:text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10'
              : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md'
          )}
        >
          {/* Icone SEULE - pas avec le titre */}
          <motion.div
            animate={{ scale: isHovered ? 1.15 : 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
          </motion.div>

          {/* Titre SEUL */}
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-semibold truncate flex-1"
            >
              {item.label}
            </motion.span>
          )}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div ref={ref} layout>
      <motion.button
        onClick={() => setExpandedId(expanded ? null : item.id)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ x: 4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-200',
          expanded
            ? darkMode
              ? 'bg-slate-800/60 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-md'
            : darkMode
            ? 'border-slate-700/50 text-slate-400 hover:border-emerald-500/40 hover:bg-slate-800/40 hover:text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10'
            : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md'
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Icone SEULE */}
          <motion.div
            animate={{ scale: isHovered ? 1.15 : 1, rotate: expanded ? 5 : 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
          </motion.div>

          {/* Titre SEUL */}
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-semibold truncate"
            >
              {item.label}
            </motion.span>
          )}
        </div>

        {isOpen && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        )}
      </motion.button>

      {/* SUBMENU - FIX BLANC */}
      <AnimatePresence>
        {expanded && isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'ml-4 mt-2 space-y-1 border-l-2 pl-3 py-2',
              darkMode
                ? 'border-emerald-500/30 bg-slate-900/20'
                : 'border-emerald-300 bg-emerald-50/30'
            )}
          >
            {item.submenu?.map((subitem: any, idx: number) => (
              <SubMenuItemRenderer
                key={idx}
                item={subitem}
                pathname={pathname}
                darkMode={darkMode}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SubMenuItemRenderer: React.FC<{
  item: any;
  pathname: string;
  darkMode: boolean;
  level: number;
}> = ({ item, pathname, darkMode, level }) => {
  const { expandedId, setExpandedId } = useMenuContext();
  const menuId = `${item.label}-${level}`;
  const expanded = expandedId === menuId;
  const hasSubSubmenu = item.submenu && item.submenu.length > 0;
  const isActive = pathname === item.href && item.href !== '#';
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (expanded && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expanded]);

  if (!hasSubSubmenu) {
    return (
      <Link href={item.href || '#'}>
        <motion.div
          ref={ref}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ x: 2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-all duration-200 cursor-pointer',
            isActive
              ? darkMode
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm'
              : darkMode
              ? 'border-slate-700/30 text-slate-500 hover:border-emerald-500/40 hover:bg-slate-800/30 hover:text-emerald-400'
              : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600'
          )}
        >
          <span className="truncate">{item.label}</span>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div ref={ref} layout>
      <motion.button
        onClick={() => setExpandedId(expanded ? null : menuId)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ x: 2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2 rounded-md border text-xs font-medium transition-all duration-200',
          expanded
            ? darkMode
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/20'
              : 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm'
            : darkMode
            ? 'border-slate-700/30 text-slate-500 hover:border-emerald-500/40 hover:bg-slate-800/30 hover:text-emerald-400'
            : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600'
        )}
      >
        <span className="truncate flex-1">{item.label}</span>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-3 w-3" />
        </motion.div>
      </motion.button>

      {/* SUB-SUBMENU */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'ml-3 mt-1 space-y-1 border-l-2 pl-2 py-1',
              darkMode
                ? 'border-slate-700/30 bg-slate-900/10'
                : 'border-slate-300 bg-slate-50/20'
            )}
          >
            {item.submenu?.map((item2: any, idx2: number) => (
              <SubMenuItemRenderer
                key={idx2}
                item={item2}
                pathname={pathname}
                darkMode={darkMode}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
