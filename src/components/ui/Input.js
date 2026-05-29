/**
 * Input Component
 * Accessible form input with validation states
 */

import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({ 
  label,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  ...props 
}, ref) => {
  const inputClassNames = [
    'form-input',
    error && 'form-input-error',
    success && 'form-input-success',
    leftIcon && 'form-input-with-left-icon',
    rightIcon && 'form-input-with-right-icon',
    fullWidth && 'form-input-full-width',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="form-input-wrapper">
        {leftIcon && <span className="form-input-icon form-input-icon-left">{leftIcon}</span>}
        <input ref={ref} className={inputClassNames} {...props} />
        {rightIcon && <span className="form-input-icon form-input-icon-right">{rightIcon}</span>}
      </div>
      {(error || success || helperText) && (
        <div className={`form-helper-text ${error ? 'form-helper-text-error' : ''} ${success ? 'form-helper-text-success' : ''}`}>
          {error || success || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
