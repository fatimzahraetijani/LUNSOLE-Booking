import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  Hotel,
  Building2,
  Tag,
  CalendarCheck,
  Users,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : 'A';

  return (
    <aside className={`admin-sidebar${isOpen ? ' mobile-open' : ''}`}>
      {/* Brand / Logo */}
      <div className="admin-sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="logo-brand-mark">
              <span className="logo-title">LUNSOLE</span>
              <span className="logo-badge">PRO</span>
            </div>
            <span className="logo-subtitle">Luxury Hotel & Booking Admin</span>
            <div className="logo-divider" />
          </div>
          {/* Close button — only visible on mobile */}
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        <div className="admin-nav-section-label">Main Management</div>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <LayoutDashboard size={18} className="nav-icon" />
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <div className="admin-nav-section-label" style={{ marginTop: 20 }}>Properties</div>

        <NavLink
          to="/admin/hotels"
          className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <BedDouble size={18} className="nav-icon" />
          <span className="nav-label">Accommodations</span>
        </NavLink>

        <NavLink
          to="/admin/hotels"
          className={({ isActive }) => `admin-nav-item sub-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <Hotel size={16} className="nav-icon" />
          <span className="nav-label">Hotels</span>
        </NavLink>

        <NavLink
          to="/admin/apartments"
          className={({ isActive }) => `admin-nav-item sub-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <Building2 size={16} className="nav-icon" />
          <span className="nav-label">Apartments</span>
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <Tag size={18} className="nav-icon" />
          <span className="nav-label">Categories</span>
        </NavLink>

        <div className="admin-nav-section-label" style={{ marginTop: 20 }}>Operations</div>

        <NavLink
          to="/admin/bookings"
          className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <CalendarCheck size={18} className="nav-icon" />
          <span className="nav-label">Bookings</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <Users size={18} className="nav-icon" />
          <span className="nav-label">Users</span>
        </NavLink>

        <div className="admin-nav-section-label" style={{ marginTop: 20 }}>Account</div>

        <button className="admin-nav-item logout" onClick={handleLogout}>
          <LogOut size={18} className="nav-icon" />
          <span className="nav-label">Logout</span>
        </button>
      </nav>

      {/* Footer — current user */}
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">{initials}</div>
          <div className="admin-sidebar-user-info">
            <div className="admin-sidebar-user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Administrator'}
            </div>
            <div className="admin-sidebar-user-role">Executive Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
