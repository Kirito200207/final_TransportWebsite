import React, { useState } from 'react';
import apiService from '../services/api';
import '../styles/AccountSecurityPage.css';

const AccountSecurityPage = ({ isActive, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.changePassword({
        currentPassword,
        newPassword
      });

      if (response.success) {
        setSuccess('Password changed successfully!');
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(response.error || 'Failed to change password, please try again');
      }
    } catch (err) {
      setError('Server error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="page-content active">
      <div className="security-container">
        <div className="page-header">
          <button className="back-button" onClick={onClose}>
            <span>‹</span> Back
          </button>
          <h2>Account Security</h2>
        </div>

        <div className="security-section">
          <h3>Change Password</h3>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="security-section">
          <h3>Security Settings</h3>
          
          <div className="setting-item">
            <div className="setting-label">
              <span>Two-Factor Authentication</span>
              <span className="setting-description">Use mobile verification code for two-factor authentication</span>
            </div>
            <div className="setting-toggle">
              <label className="switch" htmlFor="twoFactorAuth">
                <input type="checkbox" id="twoFactorAuth" />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Login Notifications</span>
              <span className="setting-description">Send email notification when logging in from a new device</span>
            </div>
            <div className="setting-toggle">
              <label className="switch" htmlFor="loginNotifications">
                <input type="checkbox" id="loginNotifications" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurityPage; 