import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordResetAPI } from '../api/api';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Request, Step 2: Verify & Reset
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await passwordResetAPI.requestReset({
        username: formData.username,
        email: formData.email
      });
      
      setMessage(response.data.message || 'Password reset request submitted. Please wait for admin approval.');
      setTimeout(() => {
        setStep(2);
        setMessage('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await passwordResetAPI.verifyAndReset({
        username: formData.username,
        code: formData.code,
        newPassword: formData.newPassword
      });
      
      setMessage(response.data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code or username. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (newStep) => {
    setMessage('');
    setError('');
    setStep(newStep);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        
        {/* Step Toggle Buttons */}
        <div className="step-toggle">
          <button
            type="button"
            className={`step-toggle-btn ${step === 1 ? 'active' : ''}`}
            onClick={() => handleStepChange(1)}
          >
            Request Reset
          </button>
          <button
            type="button"
            className={`step-toggle-btn ${step === 2 ? 'active' : ''}`}
            onClick={() => handleStepChange(2)}
          >
            Enter Code
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestReset}>
            <div className="info-box">
              <p>Request a password reset. Admin will send you a code via email.</p>
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>

            <div className="auth-links">
              <span onClick={() => navigate('/login')} className="link">
                Back to Login
              </span>
              {' | '}
              <span onClick={() => handleStepChange(2)} className="link">
                Already have a code?
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset}>
            <div className="info-box">
              <p>Enter the 6-digit code sent to your email and create a new password.</p>
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label>Reset Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="auth-links">
              <span onClick={() => handleStepChange(1)} className="link">
                Need to request code?
              </span>
              {' | '}
              <span onClick={() => navigate('/login')} className="link">
                Back to Login
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
