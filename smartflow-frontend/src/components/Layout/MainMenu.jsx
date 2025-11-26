import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MENU = [
  { path: '/dashboard', label: 'Tableau de bord' },
  { path: '/salaries', label: 'Salariés' },
  { path: '/annuaire', label: 'Annuaire' },
  { path: '/organigramme', label: 'Organigramme' },
  { path: '/admin/parametrage-societe', label: 'Paramétrage' }
];

export default function MainMenu() {
  const location = useLocation();
  return (
    <nav className="main-menu">
      <ul>
        {MENU.map(e => (
          <li key={e.path} className={location.pathname.startsWith(e.path) ? 'active' : ''}>
            <Link to={e.path}>{e.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
