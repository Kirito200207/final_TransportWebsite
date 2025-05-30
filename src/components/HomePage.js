import React from 'react';

const HomePage = ({ isActive }) => {
  return (
    <div id="homePage" className={`page-content ${isActive ? 'active' : ''}`}>
      <div className="home-container">
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome to Transit</h2>
          <p className="welcome-subtitle">Real-time public transport information</p>
        </div>
        
        {/* 快速操作区 */}
        <div className="quick-actions">
          <div className="action-card">
            <div className="action-icon">
              <img src="/img2/方向.png" alt="Plan Trip" />
            </div>
            <div className="action-text">Plan Trip</div>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <img src="/img2/闹钟.png" alt="Set Reminder" />
            </div>
            <div className="action-text">Set Reminder</div>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <img src="/img2/有轨电车.png" alt="Nearby Stops" />
            </div>
            <div className="action-text">Nearby Stops</div>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <img src="/img2/统计.png" alt="Travel History" />
            </div>
            <div className="action-text">Travel History</div>
          </div>
        </div>
        
        {/* 常用路线 */}
        <div className="frequent-routes">
          <h3 className="section-title">Frequent Routes</h3>
          <div className="route-cards">
            <div className="route-card">
              <div className="route-card-header">
                <div className="route-badge">T5</div>
                <div className="route-time">5 min</div>
              </div>
              <div className="route-card-content">
                <div className="route-from-to">
                  <div className="route-from">Home</div>
                  <div className="route-arrow">→</div>
                  <div className="route-to">Office</div>
                </div>
                <div className="route-stops">5 stops • 25 min</div>
              </div>
            </div>
            
            <div className="route-card">
              <div className="route-card-header">
                <div className="route-badge">T3</div>
                <div className="route-time">12 min</div>
              </div>
              <div className="route-card-content">
                <div className="route-from-to">
                  <div className="route-from">Home</div>
                  <div className="route-arrow">→</div>
                  <div className="route-to">Shopping Mall</div>
                </div>
                <div className="route-stops">7 stops • 32 min</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 交通状况 */}
        <div className="traffic-status">
          <h3 className="section-title">Traffic Status</h3>
          <div className="status-card">
            <div className="status-header">
              <div className="status-icon">
                <img src="/img2/有轨电车.png" alt="Tram" />
              </div>
              <div className="status-title">Tram Network</div>
              <div className="status-indicator good">Good</div>
            </div>
            <div className="status-details">
              All lines operating normally. Average wait time: 4.5 min.
            </div>
          </div>
          
          <div className="status-card">
            <div className="status-header">
              <div className="status-icon">
                <img src="/img2/android-bus.png" alt="Bus" />
              </div>
              <div className="status-title">Bus Network</div>
              <div className="status-indicator warning">Minor Delays</div>
            </div>
            <div className="status-details">
              Minor delays on routes 123 and 456 due to road works.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 