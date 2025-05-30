import React from 'react';

const SettingPage = ({ isActive, onLogout }) => {
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

  return (
    <div id="settingPage" className={`page-content ${isActive ? 'active' : ''}`} style={{ height: 'auto' }}>
      <div className="settings-container">
        <h2 className="settings-title">Settings</h2>
        
        {/* 个人信息设置 */}
        <div className="settings-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/设置.png" alt="Profile" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Profile</div>
              <div className="setting-arrow">›</div>
            </div>
          </div>
          <div className="setting-item">
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
                <label className="switch">
                  <input type="checkbox" defaultChecked />
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
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
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
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/方向.png" alt="Map Settings" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Map Settings</div>
              <div className="setting-arrow">›</div>
            </div>
          </div>
          <div className="setting-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
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