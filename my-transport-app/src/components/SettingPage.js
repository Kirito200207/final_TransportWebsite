import React, { useState, useEffect } from 'react';
import ProfilePage from './ProfilePage';
import AccountSecurityPage from './AccountSecurityPage';
import MapSettingsPage from './MapSettingsPage';
import apiService from '../services/api';

const SettingPage = ({ isActive, onLogout, currentUser }) => {
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [showSecurityPage, setShowSecurityPage] = useState(false);
  const [showMapSettingsPage, setShowMapSettingsPage] = useState(false);
  const [settings, setSettings] = useState({
    reminder_enabled: true,
    notification_enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取用户设置
  useEffect(() => {
    if (isActive) {
      fetchUserSettings();
    }
  }, [isActive]);

  // 获取用户设置的函数
  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUserSettings();
      console.log('获取到用户设置:', response.data);
      
      // 如果返回的是数组（可能有多个设置记录），取第一个
      if (Array.isArray(response.data) && response.data.length > 0) {
        setSettings(response.data[0]);
      } else if (response.data && response.data.id) {
        // 如果是单个对象
        setSettings(response.data);
      }
    } catch (err) {
      console.error('获取用户设置失败:', err);
      setError('Failed to load settings');
      // 使用默认设置
      setSettings({
        reminder_enabled: true,
        notification_enabled: true
      });
    } finally {
      setLoading(false);
    }
  };

  // 更新提醒设置
  const handleReminderToggle = async (e) => {
    const newValue = e.target.checked;
    try {
      setLoading(true);
      const updatedSettings = { ...settings, reminder_enabled: newValue };
      
      // 如果settings没有id，说明后端还没有为当前用户创建设置记录
      if (!settings.id) {
        // 创建新的设置记录
        await apiService.updateUserSettings(updatedSettings);
        // 重新获取设置以获取id
        await fetchUserSettings();
      } else {
        // 更新现有设置
        await apiService.updateUserSettings(updatedSettings);
        setSettings(updatedSettings);
      }
      
      console.log('提醒设置已更新:', newValue);
    } catch (err) {
      console.error('更新提醒设置失败:', err);
      // 恢复原始状态
      e.target.checked = settings.reminder_enabled;
      setError('Failed to update reminder settings');
    } finally {
      setLoading(false);
    }
  };

  // 更新通知设置
  const handleNotificationToggle = async (e) => {
    const newValue = e.target.checked;
    try {
      setLoading(true);
      const updatedSettings = { ...settings, notification_enabled: newValue };
      
      // 如果settings没有id，说明后端还没有为当前用户创建设置记录
      if (!settings.id) {
        // 创建新的设置记录
        await apiService.updateUserSettings(updatedSettings);
        // 重新获取设置以获取id
        await fetchUserSettings();
      } else {
        // 更新现有设置
        await apiService.updateUserSettings(updatedSettings);
        setSettings(updatedSettings);
      }
      
      console.log('通知设置已更新:', newValue);
    } catch (err) {
      console.error('更新通知设置失败:', err);
      // 恢复原始状态
      e.target.checked = settings.notification_enabled;
      setError('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  // 添加登出处理函数
  const handleLogout = () => {
    // 如果有传入的onLogout函数，则调用它
    if (onLogout) {
      onLogout();
    } else {
      // 否则，使用默认的登出逻辑
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };
  
  // 处理键盘事件
  const handleKeyDown = (action, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  if (!isActive) return null;

  if (showProfilePage) {
    return <ProfilePage isActive={true} onClose={() => setShowProfilePage(false)} currentUser={currentUser} />;
  }

  if (showSecurityPage) {
    return <AccountSecurityPage isActive={true} onClose={() => setShowSecurityPage(false)} />;
  }

  if (showMapSettingsPage) {
    return <MapSettingsPage isActive={true} onClose={() => setShowMapSettingsPage(false)} />;
  }

  return (
    <div id="settingPage" className={`page-content ${isActive ? 'active' : ''}`} style={{ height: 'auto' }}>
      <div className="settings-container">
        <h2 className="settings-title">Settings</h2>
        
        {/* 个人信息设置 */}
        <div className="settings-section">
          <h3 className="section-title">Personal Information</h3>
          <div 
            className="setting-item" 
            onClick={() => setShowProfilePage(true)} 
            onKeyDown={(e) => handleKeyDown(() => setShowProfilePage(true), e)}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <div className="setting-icon">
              <img src="/img2/profile.png" alt="Profile" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Profile</div>
              <div className="setting-arrow">›</div>
            </div>
          </div>
          <div 
            className="setting-item" 
            onClick={() => setShowSecurityPage(true)} 
            onKeyDown={(e) => handleKeyDown(() => setShowSecurityPage(true), e)}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <div className="setting-icon">
              <img src="/img2/统计.png" alt="Account Security" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Account Security</div>
              <div className="setting-arrow">›</div>
            </div>
          </div>
        </div>
        
        {/* 通知设置 */}
        <div className="settings-section">
          <h3 className="section-title">Notifications</h3>
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/闹钟.png" alt="Reminder Settings" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Reminder Settings</div>
              <div className="setting-toggle">
                <label className="switch" htmlFor="reminderToggle">
                  <span className="visually-hidden">Enable reminder notifications</span>
                  <input 
                    id="reminderToggle"
                    type="checkbox" 
                    checked={settings?.reminder_enabled || false} 
                    onChange={handleReminderToggle}
                    disabled={loading}
                    aria-label="Enable reminder notifications"
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/提示 (1).png" alt="Message Notifications" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Message Notifications</div>
              <div className="setting-toggle">
                <label className="switch" htmlFor="notificationToggle">
                  <span className="visually-hidden">Enable message notifications</span>
                  <input 
                    id="notificationToggle"
                    type="checkbox" 
                    checked={settings?.notification_enabled || false}
                    onChange={handleNotificationToggle}
                    disabled={loading}
                    aria-label="Enable message notifications"
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
          {error && (
            <div className="settings-error">
              {error}
            </div>
          )}
        </div>
        
        {/* 应用设置 */}
        <div className="settings-section">
          <h3 className="section-title">App Settings</h3>
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/更新.png" alt="Check for Updates" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Check for Updates</div>
              <div className="setting-value">V1.0.0</div>
            </div>
          </div>
          <div 
            className="setting-item" 
            onClick={() => setShowMapSettingsPage(true)} 
            onKeyDown={(e) => handleKeyDown(() => setShowMapSettingsPage(true), e)}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <div className="setting-icon">
              <img src="/img2/设置.png" alt="Map Settings" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Map Settings</div>
              <div className="setting-arrow">›</div>
            </div>
          </div>
          <div 
            className="setting-item" 
            onClick={handleLogout} 
            onKeyDown={(e) => handleKeyDown(handleLogout, e)}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <div className="setting-icon">
              <img src="/img2/退出.png" alt="Log Out" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Log Out</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage; 