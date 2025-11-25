import React from 'react';
import { Link } from 'react-router-dom';
import { MENU_ITEMS } from '../../utils/constants';
import './Sidebar.css';

export default function Sidebar({ isOpen, userRole = 'admin' }) {
  const menuItems = MENU_ITEMS[userRole] || MENU_ITEMS.admin;

  return (
    <aside className={'sidebar ' + (isOpen ? 'open' : 'closed')}>
      <div className="sidebar-header">
        <h2>MSI TeamHub</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, idx) => (
          <Link key={idx} to={item.path} className="nav-item">
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
