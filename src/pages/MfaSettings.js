import React, { useState } from 'react';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './MfaSettings.css';

const MfaSettings = () => {
  const { user, login } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSetup, setShowSetup] = useState(false);

  const handleSetupMfa = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await authAPI.setupMfa();
      if (response.data.success) {
        setQrCode(response.data.data.qrCodeImage);
        setSecret(response.data.data.secret);
        setShowSetup(true);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to setup MFA' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await authAPI.enableMfa(verificationCode);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'MFA enabled successfully!' });
        setMfaEnabled(true);
        // Update user context to reflect MFA is enabled
        const token = localStorage.getItem('token');
        login({ ...user, mfaEnabled: true }, token);
        setShowSetup(false);
        setQrCode(null);
        setSecret(null);
        setVerificationCode('');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Invalid verification code' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!window.confirm('Are you sure you want to disable MFA?')) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await authAPI.disableMfa();
      if (response.data.success) {
        setMessage({ type: 'success', text: 'MFA disabled successfully!' });
        setMfaEnabled(false);
        // Update user context to reflect MFA is disabled
        const token = localStorage.getItem('token');
        login({ ...user, mfaEnabled: false }, token);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to disable MFA' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mfa-settings-container">
      <div className="mfa-settings-card">
        <h2>Two-Factor Authentication (MFA)</h2>
        <p className="mfa-description">
          Add an extra layer of security to your admin account using Google Authenticator.
        </p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {!showSetup ? (
          <div className="mfa-status">
            <div className="status-indicator">
              <span className={`status-dot ${mfaEnabled ? 'enabled' : 'disabled'}`}></span>
              <span className="status-text">
                MFA is currently <strong>{mfaEnabled ? 'ENABLED' : 'DISABLED'}</strong>
              </span>
            </div>

            {!mfaEnabled ? (
              <button 
                onClick={handleSetupMfa} 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Setting up...' : 'Enable MFA'}
              </button>
            ) : (
              <button 
                onClick={handleDisableMfa} 
                disabled={loading}
                className="btn btn-danger"
              >
                {loading ? 'Disabling...' : 'Disable MFA'}
              </button>
            )}
          </div>
        ) : (
          <div className="mfa-setup">
            <h3>Setup Google Authenticator</h3>
            
            <div className="setup-steps">
              <div className="step">
                <span className="step-number">1</span>
                <p>Install Google Authenticator on your mobile device</p>
              </div>
              
              <div className="step">
                <span className="step-number">2</span>
                <p>Scan this QR code with the app</p>
              </div>
              
              {qrCode && (
                <div className="qr-code-container">
                  <img src={qrCode} alt="MFA QR Code" className="qr-code" />
                </div>
              )}
              
              {secret && (
                <div className="secret-container">
                  <p className="secret-label">Or enter this code manually:</p>
                  <code className="secret-code">{secret}</code>
                </div>
              )}
              
              <div className="step">
                <span className="step-number">3</span>
                <p>Enter the 6-digit code from the app to verify</p>
              </div>
              
              <form onSubmit={handleEnableMfa} className="verification-form">
                <input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  className="verification-input"
                />
                
                <div className="button-group">
                  <button 
                    type="submit" 
                    disabled={loading || verificationCode.length !== 6}
                    className="btn btn-primary"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowSetup(false);
                      setQrCode(null);
                      setSecret(null);
                      setVerificationCode('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mfa-info-box">
          <h4>📱 What is MFA?</h4>
          <ul>
            <li>MFA adds an extra security layer to your account</li>
            <li>You'll need your phone to log in, even if someone knows your password</li>
            <li>Google Authenticator generates time-based codes that change every 30 seconds</li>
            <li>Keep your phone secure and backed up</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MfaSettings;
