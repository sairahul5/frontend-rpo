import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    password: ''
  });

  const validateUsername = (username) => {
    if (!username) return 'Username is required';
    if (username.length < 5) return 'Username must be at least 5 characters';
    if (username.length > 39) return 'Username must be at most 39 characters';
    if (!/^[a-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/.test(username)) {
      return 'Username must contain only lowercase letters, numbers, and symbols';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-zA-Z]/.test(password)) return 'Password must contain letters';
    if (!/[0-9]/.test(password)) return 'Password must contain numbers';
    if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain symbols';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (name === 'username') {
      const error = validateUsername(value);
      setValidationErrors((prev) => ({ ...prev, username: error }));
    } else if (name === 'password') {
      const error = validatePassword(value);
      setValidationErrors((prev) => ({ ...prev, password: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate before submission
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);
    
    if (usernameError || passwordError) {
      setValidationErrors({
        username: usernameError,
        password: passwordError
      });
      return;
    }
    
    try {
      const response = await authAPI.register(formData);
      if (response.data.success) {
        const { token, name, email, role } = response.data.data;
        login({ name, email, role }, token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="e.g., sairahul_adabala@5"
            />
            {validationErrors.username && (
              <p className="error" style={{ fontSize: '0.85em', marginTop: '4px' }}>
                {validationErrors.username}
              </p>
            )}
            <small style={{ color: '#666', fontSize: '0.85em' }}>
              Min 5 chars, lowercase letters, optional numbers and symbols
            </small>
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Your email address"
            />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {validationErrors.password && (
              <p className="error" style={{ fontSize: '0.85em', marginTop: '4px' }}>
                {validationErrors.password}
              </p>
            )}
            <small style={{ color: '#666', fontSize: '0.85em' }}>
              Min 8 chars, must include letters, numbers, and symbols
            </small>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
