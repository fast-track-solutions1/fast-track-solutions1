// app/(app)/components/SidebarNew.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { menuConfig } from '@/lib/menu/menuConfig';
import { usePermissions } from '@/lib/auth/usePermissions';
import { MenuItem as MenuItemType } from '@/types/menu.types';

const SidebarNew = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, hasRole } = usePermissions();

  // Toggle expansion des sous-menus
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Vérifie si la route actuelle correspond au menu
  const isActive = (href?: string) => {
    if (!href || href === '#') return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Vérifie si un menu parent est actif (pour mettre en avant les sous-menus)
  const isParentActive = (item: MenuItemType): boolean => {
    if (item.submenu) {
      return item.submenu.some(sub => isActive(sub.href) || (sub.submenu && sub.submenu.some(s => isActive(s.href))));
    }
    return false;
  };

  // Rend un item de menu
  const renderMenuItem = (item: MenuItemType, level: number = 0): React.ReactNode => {
    // Vérifie les permissions
    if (!hasRole(item.roles)) return null;

    // Divider
    if (item.divider) {
      return (
        <div key={item.id} className="my-2 border-t border-gray-200 dark:border-gray-700" />
      );
    }

    const hasChildren = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href);
    const parentActive = isParentActive(item);
    const Icon = item.icon;
    const marginLeft = level > 0 ? `ml-${level * 2}` : '';

    return (
      <div key={item.id}>
        {hasChildren ? (
          // Bouton pour les items avec sous-menus
          <button
            onClick={() => toggleExpand(item.id)}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 rounded-lg
              text-sm font-medium transition-all duration-200
              ${parentActive || isExpanded
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }
            `}
          >
            <div className="flex items-center gap-3 flex-1">
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={`
                    px-2 py-0.5 text-xs font-semibold rounded-full
                    ${item.badgeColor === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' : ''}
                    ${item.badgeColor === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' : ''}
                    ${item.badgeColor === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                    ${item.badgeColor === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' : ''}
                    ${!item.badgeColor ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : ''}
                  `}>
                    {item.badge}
                  </span>
                )}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
              </div>
            )}
          </button>
        ) : (
          // Lien pour les items sans sous-menus
          <Link
            href={item.href || '#'}
            className={`
              flex items-center justify-between px-3 py-2.5 rounded-lg
              text-sm font-medium transition-all duration-200
              ${active
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }
            `}
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && item.badge && (
              <span className={`
                px-2 py-0.5 text-xs font-semibold rounded-full
                ${item.badgeColor === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' : ''}
                ${item.badgeColor === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' : ''}
                ${item.badgeColor === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                ${item.badgeColor === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' : ''}
                ${!item.badgeColor ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : ''}
              `}>
                {item.badge}
              </span>
            )}
          </Link>
        )}

        {/* Sous-menus */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.submenu?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Bouton mobile pour ouvrir/fermer */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 z-40
          ${collapsed ? 'w-16' : 'w-64'}
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              MSI TeamHub
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={collapsed ? 'Développer' : 'Réduire'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
          {menuConfig.map(item => renderMenuItem(item, 0))}
        </nav>

        {/* Infos utilisateur (optionnel) */}
        {user && !collapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </div>
              <div className="flex-1 text-xs">
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-gray-500 dark:text-gray-400">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Padding pour décaler le contenu */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`} />
    </>
  );
};

export default SidebarNew;
