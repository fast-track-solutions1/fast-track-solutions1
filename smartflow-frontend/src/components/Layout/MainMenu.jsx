import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainMenu.css';

const MENU = [
  { 
    path: '/dashboard', 
    label: 'Tableau de bord', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  },
  { 
    path: '/salaries', 
    label: 'Salariés', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        ircle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  { 
    path: '/annuaire', 
    label: 'Annuaire', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    )
  },
  { 
    path: '/organigramme', 
    label: 'Organigramme', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v6m0 0v6m0-6h6m-6 0H6m6 12v-3m0 0v-3m0 3h3m-3 0h-3"/>
        <rect x="9" y="9" width="6" height="6" rx="1"/>
      </svg>
    )
  },
  { 
    path: '/admin/parametrage-societe', 
    label: 'Paramétrage', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        ircle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m2.12-2.12l4.24-4.24"/>
      </svg>
    )
  }
];

export default function MainMenu() {
  const location = useLocation();

  return (
    <nav className="main-menu">
      <div className="menu-header">
        <div className="logo-container">
          <svg className="logo-svg" width="220" height="60" viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background glow effect */}
            <defs>
              <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
              </linearGradient>
              <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#14b8a6', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#0d9488', stopOpacity: 1}} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Left accent bar */}
            <rect x="5" y="10" width="4" height="40" rx="2" fill="url(#logoGradient1)" filter="url(#glow)"/>

            {/* MSI Text */}
            <text x="25" y="38" fontFamily="'Poppins', sans-serif" fontSize="28" fontWeight="900" fill="url(#logoGradient1)" letterSpacing="2">
              MSI
            </text>

            {/* Divider */}
            <line x1="80" y1="15" x2="80" y2="50" stroke="url(#logoGradient2)" strokeWidth="2" opacity="0.6"/>

            {/* Team Hub Text */}
            <text x="95" y="28" fontFamily="'Inter', sans-serif" fontSize="16" fontWeight="700" fill="white" letterSpacing="1">
              TEAM
            </text>
            <text x="95" y="48" fontFamily="'Inter', sans-serif" fontSize="16" fontWeight="700" fill="url(#logoGradient2)" letterSpacing="1">
              HUB
            </text>

            {/* Decorative dots */}
            ircle cx="200" cy="20" r="2.5" fill="url(#logoGradient1)" opacity="0.7"/>
            ircle cx="210" cy="25" r="2.5" fill="url(#logoGradient2)" opacity="0.7"/>
            ircle cx="205" cy="40" r="2.5" fill="url(#logoGradient1)" opacity="0.7"/>
          </svg>
        </div>
      </div>

      <div className="menu-divider"></div>

      <ul className="menu-list">
        {MENU.map(e => (
          <li 
            key={e.path} 
            className={`menu-item ${location.pathname.startsWith(e.path) ? 'active' : ''}`}
          >
            <Link to={e.path} className="menu-link">
              <span className="menu-icon">{e.icon}</span>
              <span className="menu-label">{e.label}</span>
              {location.pathname.startsWith(e.path) && <span className="menu-indicator"></span>}
            </Link>
          </li>
        ))}
      </ul>

      <div className="menu-footer">
        <div className="footer-text">My Support International</div>
      </div>
    </nav>
  );
}
