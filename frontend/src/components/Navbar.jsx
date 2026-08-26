import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Compass } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="nav-brand" onClick={() => setIsOpen(false)}>
          LUNSOLE<span>.</span>
        </Link>

        {/* Menu toggler for mobile */}
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu links */}
        <ul className={`nav-menu ${isOpen ? 'open' : ''}`}>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/search" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={() => setIsOpen(false)}
            >
              Explore
            </NavLink>
          </li>
          <li>
            <a href="#features" className="nav-link" onClick={() => setIsOpen(false)}>
              Services
            </a>
          </li>
          {user && (
            <li>
              <NavLink 
                to="/favorites" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                onClick={() => setIsOpen(false)}
              >
                Favorites
              </NavLink>
            </li>
          )}
          {user && user.role === 'admin' && (
            <li>
              <NavLink 
                to="/admin" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                onClick={() => setIsOpen(false)}
              >
                Admin Panel
              </NavLink>
            </li>
          )}

          {/* Mobile Auth Links inside the menu */}
          <li className="nav-auth">
            {user ? (
              <>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: '600' }} onClick={() => setIsOpen(false)}>
                  <User size={18} />
                  <span>Hi, {user.first_name}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                  Book Now
                </Link>
              </>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};
