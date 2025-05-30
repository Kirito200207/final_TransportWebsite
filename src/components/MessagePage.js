import React from 'react';

const MessagePage = ({ isActive }) => {
  return (
    <div id="messagePage" className={`page-content ${isActive ? 'active' : ''}`} style={{ height: 'auto' }}>
      <div className="messages-container">
        <div className="chat-section">
          <div className="chat-container">
            <div className="avatar-column">
              <img
                loading="lazy"
                src="/img2/android-bus.png"
                className="chat-avatar"
                alt="Bus Service"
              />
            </div>
            <div className="content-column">
              <div className="message-wrapper1">
                <div className="message-title">Bus Service Alert</div>
                <div className="message-subtitle">Route 123: Arriving in 5 minutes at Central Station</div>
              </div>
            </div>
          </div>
        </div>
        <div className="chat-section">
          <div className="chat-container">
            <div className="avatar-column">
              <img
                loading="lazy"
                src="/img2/有轨电车.png"
                className="chat-avatar"
                alt="Tram Service"
              />
            </div>
            <div className="content-column">
              <div className="message-wrapper1">
                <div className="message-title">Tram Service Update</div>
                <div className="message-subtitle">Line T5: Schedule change on weekends starting next week</div>
              </div>
            </div>
          </div>
        </div>
        <div className="chat-section">
          <div className="chat-container">
            <div className="avatar-column">
              <img
                loading="lazy"
                src="/img2/提示 (1).png"
                className="chat-avatar"
                alt="System Alert"
              />
            </div>
            <div className="content-column">
              <div className="message-wrapper1">
                <div className="message-title">System Notification</div>
                <div className="message-subtitle">App updated to version 2.1.0 with new features</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage; 