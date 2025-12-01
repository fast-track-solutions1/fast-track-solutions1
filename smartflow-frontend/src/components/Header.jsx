import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ titre }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="page-title">{titre}</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="user-name">Utilisateur connecté</span>
          <button className="btn-logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
