import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/admin':            'Dashboard',
  '/admin/hotels':     'Hotels',
  '/admin/apartments': 'Apartments',
  '/admin/categories': 'Categories',
  '/admin/bookings':   'Bookings',
  '/admin/users':      'Users',
};

export const AdminHeader = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const title = PAGE_TITLES[pathname] || 'Admin Panel';

  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : 'A';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button className="admin-header-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <Menu size={18} />
        </button>
        <h1 className="admin-header-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        <span className="admin-header-date">{dateStr}</span>

        <div className="admin-header-user">
          <div className="admin-header-avatar">{initials}</div>
          <span className="admin-header-user-name">
            {user ? `${user.first_name} ${user.last_name}` : 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};
