/**
 * Button Component
 * Enterprise-level button with variants and states
 */

import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    loading && 'btn-loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classNames}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {!loading && icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
    </button>
  );
};

export default Button;
