import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainMenu from './MainMenu';
import Header from '../Header';

const TITRES = {
  '/dashboard': 'Tableau de bord',
  '/salaries': 'Salariés',
  '/annuaire': 'Annuaire',
  '/organigramme': 'Organigramme',
  '/admin/parametrage-societe': 'Paramétrage'
};

export default function MainLayout() {
  const location = useLocation();
  const titrePage = Object.entries(TITRES)
    .find(([path]) => location.pathname.startsWith(path))?.[1] || 'Application RH';

  return (
    <div className="main-layout">
      <aside>
        <MainMenu />
      </aside>
      <main>
        <Header titre={titrePage} />
        <section className="main-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
