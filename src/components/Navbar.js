import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, isEditor } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo Section */}
          <div className="navbar-brand-section">
            <Link to="/" className="navbar-brand">
              <span className="brand-logo">📄</span>
              <div className="brand-text">
                <span className="brand-name">QP Management</span>
                <span className="brand-subtitle">Question Paper System</span>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Navigation Links */}
          <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="nav-links">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/question-papers" 
                className={`nav-link ${isActive('/question-papers') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Question Papers
              </Link>
              <Link 
                to="/portfolio" 
                className={`nav-link ${isActive('/portfolio') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link 
                to="/solutions" 
                className={`nav-link ${isActive('/solutions') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              {user && isAdmin() && (
                <Link 
                  to="/admin" 
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              {user && isEditor() && !isAdmin() && (
                <Link 
                  to="/editor" 
                  className={`nav-link ${isActive('/editor') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Editor Panel
                </Link>
              )}
            </div>

            {/* User Section */}
            {user ? (
              <div className="user-menu">
                <div className="user-profile">
                  <div className="user-avatar">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">
                      {isAdmin() ? 'Admin' : isEditor() ? 'Editor' : 'User'}
                    </span>
                  </div>
                </div>
                <button onClick={logout} className="btn-logout">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link 
                  to="/login" 
                  className="btn-login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
