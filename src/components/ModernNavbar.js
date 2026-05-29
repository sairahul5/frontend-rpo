/**
 * Modern Enterprise Navbar
 * Responsive navigation with glassmorphism effect
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ModernNavbar.css';

const ModernNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/question-papers', label: 'Question Papers', icon: '📄' },
    { path: '/portfolio', label: 'Portfolio', icon: '💼' },
    { path: '/solutions', label: 'Solutions', icon: '💡' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ path: '/admin', label: 'Admin', icon: '⚙️' });
  }

  if (user?.role === 'EDITOR') {
    navItems.push({ path: '/editor', label: 'Editor', icon: '✏️' });
  }

  return (
    <nav className={`modern-navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">QP</div>
          <div className="brand-text">
            <span className="brand-name">QuestionPaper</span>
            <span className="brand-tagline">Management System</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu desktop-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <svg 
                  className={`chevron ${userMenuOpen ? 'open' : ''}`}
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="dropdown-user-name">{user.name}</div>
                        <div className="dropdown-user-email">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <span className="dropdown-item-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default ModernNavbar;
