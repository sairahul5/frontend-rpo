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
  const [mfaData, setMfaData] = useState({
    code: ''
  });
  const [error, setError] = useState('');
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMfaChange = (e) => {
    setMfaData({
      ...mfaData,
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
        if (response.data.data.mfaRequired) {
          setIsMfaRequired(true);
          setTempToken(response.data.data.tempToken);
        } else {
          const { token, name, email, role, mfaEnabled } = response.data.data;
          login({ name, email, role, mfaEnabled }, token);
          navigate('/');
        }
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

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authAPI.verifyMfa({ tempToken, code: mfaData.code });
      if (response.data.success) {
        const { token, name, email, role, mfaEnabled } = response.data.data;
        login({ name, email, role, mfaEnabled }, token);
        navigate('/');
      } else {
        setError(response.data.message || 'MFA verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'MFA verification failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login {isMfaRequired && "- MFA Verification"}</h2>
        
        {!isMfaRequired ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block">Login</button>
            <p className="auth-link" style={{ marginTop: '15px' }}>
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit}>
            <div className="form-group">
              <label htmlFor="code">MFA Code</label>
              <input
                id="code"
                type="text"
                name="code"
                value={mfaData.code}
                onChange={handleMfaChange}
                required
                placeholder="Enter 6-digit code"
                maxLength="6"
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block">Verify</button>
            <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: '10px' }} onClick={() => setIsMfaRequired(false)}>Back to Login</button>
          </form>
        )}
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
