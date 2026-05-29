import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Login attempt with:', formData);
      const response = await authAPI.login(formData);
      console.log('Login response:', response);
      if (response.data.success) {
        const { token, name, email, role } = response.data.data;
        login({ name, email, role }, token);
        navigate('/');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block">Login</button>
          </form>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="auth-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
