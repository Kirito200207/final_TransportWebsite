import React from 'react';

const InfoPage = ({ isActive }) => {
  return (
    <div id="infoPage" className={`page-content ${isActive ? 'active' : ''}`}>
      <section className="info-container">
        <div className="info-wrapper">
          {/* 有轨电车信息卡片 */}
          <article className="info-card">
            <div className="info-header">
              <div className="header-left">
                <img loading="lazy" src="/img2/有轨电车.png" className="icon-medium" alt="Tram" />
                <h3>Tram Network Status</h3>
              </div>
              <span className="status-badge operational">All Lines Operating</span>
            </div>

            {/* 线路信息 */}
            <div className="route-info">
              {/* T5线路 */}
              <div className="route-item">
                <div className="route-header">
                  <div className="route-title">
                    <span className="route-number">T5</span>
                    <span className="route-status active">Active</span>
                  </div>
                  <div className="passenger-info">
                    <span className="passenger-count">Current Load: 65%</span>
                    <div className="capacity-bar">
                      <div className="capacity-fill" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="route-path">West Mall → Central Station → East Station</div>
                <div className="route-details">
                  <div className="detail-item">
                    <span className="detail-label">Next Arrival:</span>
                    <span className="detail-value">3 min</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Frequency:</span>
                    <span className="detail-value">Every 8 min</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Operating Cars:</span>
                    <span className="detail-value">4/5</span>
                  </div>
                </div>
              </div>

              {/* T3线路 */}
              <div className="route-item">
                <div className="route-header">
                  <div className="route-title">
                    <span className="route-number">T3</span>
                    <span className="route-status active">Active</span>
                  </div>
                  <div className="passenger-info">
                    <span className="passenger-count">Current Load: 45%</span>
                    <div className="capacity-bar">
                      <div className="capacity-fill" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="route-path">North Square → City Center → South Terminal</div>
                <div className="route-details">
                  <div className="detail-item">
                    <span className="detail-label">Next Arrival:</span>
                    <span className="detail-value">5 min</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Frequency:</span>
                    <span className="detail-value">Every 10 min</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Operating Cars:</span>
                    <span className="detail-value">3/4</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* 系统状态卡片 */}
          <article className="info-card-secondary">
            <div className="info-header">
              <h3>System Overview</h3>
              <span className="update-time">Last Updated: 2 min ago</span>
            </div>
            <div className="system-stats">
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Total Passengers Today</span>
                  <span className="stat-value">12,458</span>
                  <span className="stat-trend positive">↑ 8% vs. yesterday</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Average Wait Time</span>
                  <span className="stat-value">4.5 min</span>
                  <span className="stat-trend positive">↓ 0.5 min</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">On-Time Performance</span>
                  <span className="stat-value">96%</span>
                  <span className="stat-trend positive">↑ 2%</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Operating Trams</span>
                  <span className="stat-value">7/9</span>
                  <span className="stat-trend neutral">Normal</span>
                </div>
              </div>
            </div>
          </article>

          {/* 实时更新卡片 */}
          <article className="info-card-tertiary">
            <div className="info-header">
              <h3>Live Updates</h3>
            </div>
            <div className="updates-list">
              <div className="update-item">
                <span className="update-time">10:30 AM</span>
                <div className="update-content">
                  <span className="update-title">T5 Line: Peak Hours Adjustment</span>
                  <p className="update-text">Additional tram deployed to handle morning rush. Frequency increased to every 6 minutes.</p>
                </div>
              </div>
              <div className="update-item">
                <span className="update-time">09:15 AM</span>
                <div className="update-content">
                  <span className="update-title">T3 Line: Station Maintenance</span>
                  <p className="update-text">Brief 2-minute stops at Central Station due to routine platform inspection.</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};

export default InfoPage; 