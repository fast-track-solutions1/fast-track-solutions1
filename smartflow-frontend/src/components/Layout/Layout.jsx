import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} userRole={user?.role} />
      <div className="main-content">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={user?.username}
          onLogout={handleLogout}
        />
        <div className="content fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
