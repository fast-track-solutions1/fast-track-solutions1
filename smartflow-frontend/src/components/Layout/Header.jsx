import React from 'react';
import './Header.css';

export default function Header({ onToggleSidebar, userName, onLogout }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="btn-toggle" onClick={onToggleSidebar}>
          ☰
        </button>
        <h2 className="page-title">Tableau de bord</h2>
      </div>

      <div className="header-right">
        <div className="user-info">
          <span className="user-name">{userName}</span>
          <button className="btn btn-logout" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
