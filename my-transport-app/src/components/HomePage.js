import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const HomePage = ({ isActive, onNavigate }) => {
  const [transportTypes, setTransportTypes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [systemStatus, setSystemStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data
  const mockData = {
    transportTypes: [
      { id: 1, name: 'Tram', icon: '/img2/tram.png' },
      { id: 2, name: 'Bus', icon: '/img2/android-bus.png' }
    ],
    systemStatus: [
      { 
        id: 1, 
        name: 'Tram Network', 
        status: 'good', 
        details: 'All lines operating normally. Average wait time: 4.5 min.'
      },
      {
        id: 2,
        name: 'Bus Network',
        status: 'warning',
        details: 'Minor delays on routes 123 and 456 due to road works.'
      }
    ],
    routes: [
      {
        id: 1,
        route_number: 'T5',
        name: 'Home - Office',
        estimated_time: '5 min',
        stops_count: 5,
        duration: 25
      },
      {
        id: 2,
        route_number: 'T3',
        name: 'Home - Shopping Mall',
        estimated_time: '12 min',
        stops_count: 7,
        duration: 32
      }
    ]
  };

  // Function to safely check if a string contains a substring
  const safeIncludes = (str, searchStr) => {
    if (typeof str === 'string') {
      return str.includes(searchStr);
    }
    return false;
  };

  useEffect(() => {
    // Only load data when component is active
    if (isActive) {
      fetchData();
    }
  }, [isActive]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use mock data since backend may not be running
      setTransportTypes(mockData.transportTypes);
      setRoutes(mockData.routes);
      setSystemStatus(mockData.systemStatus);
      setLoading(false);
      
      // Try to fetch data from backend (if running)
      try {
        const transportTypesRes = await apiService.getTransportTypes();
        if (transportTypesRes && transportTypesRes.data) {
          setTransportTypes(transportTypesRes.data);
        }
      } catch (err) {
        console.log('Using mock data for transport types');
      }
      
      try {
        const routesRes = await apiService.getRoutes();
        if (routesRes && routesRes.data) {
          setRoutes(routesRes.data.results || routesRes.data);
        }
      } catch (err) {
        console.log('Using mock data for routes');
      }
      
      try {
        const systemStatusRes = await apiService.getSystemStatus();
        if (systemStatusRes && systemStatusRes.data) {
          setSystemStatus(systemStatusRes.data.results || systemStatusRes.data);
        }
      } catch (err) {
        console.log('Using mock data for system status');
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Using local data instead.');
      setLoading(false);
    }
  };

  // Handle route name splitting
  const getRouteFromTo = (routeName) => {
    if (!routeName) return { from: 'Unknown', to: 'Unknown' };
    
    const parts = routeName.split(' - ');
    if (parts.length >= 2) {
      return { from: parts[0], to: parts[1] };
    }
    return { from: routeName, to: 'Destination' };
  };

  // Handle navigation to reminder page
  const handleReminderClick = () => {
    if (onNavigate) {
      onNavigate('reminder');
    }
  };
  
  // Handle navigation to plan trip page
  const handlePlanTripClick = () => {
    if (onNavigate) {
      onNavigate('plantrip');
    }
  };
  
  // Handle navigation to nearby stops page
  const handleNearbyStopsClick = () => {
    if (onNavigate) {
      onNavigate('nearbystops');
    }
  };
  
  // Handle navigation to travel history page
  const handleTravelHistoryClick = () => {
    if (onNavigate) {
      onNavigate('travelhistory');
    }
  };

  // 处理键盘事件
  const handleKeyDown = (event, handler) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  };

  return (
    <div id="homePage" className={`page-content ${isActive ? 'active' : ''}`}>
      <div className="home-container">
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome to Transit</h2>
          <p className="welcome-subtitle">Real-time public transport information</p>
        </div>
        
        {loading && <div className="loading-indicator">Loading data...</div>}
        {error && <div className="error-message">{error}</div>}
        
        {/* Quick Actions */}
        <div className="quick-actions">
          <div 
            className="action-card" 
            onClick={handlePlanTripClick}
            onKeyDown={(e) => handleKeyDown(e, handlePlanTripClick)}
            role="button"
            tabIndex="0"
          >
            <div className="action-icon">
              <img src="/img2/Route (1).png" alt="Routes" />
            </div>
            <div className="action-text">Routes</div>
          </div>
          <div 
            className="action-card" 
            onClick={handleNearbyStopsClick}
            onKeyDown={(e) => handleKeyDown(e, handleNearbyStopsClick)}
            role="button"
            tabIndex="0"
          >
            <div className="action-icon">
              <img src="/img2/公交站点.png" alt="Nearby Stops" />
            </div>
            <div className="action-text">Nearby Stops</div>
          </div>
          <div 
            className="action-card" 
            onClick={handleTravelHistoryClick}
            onKeyDown={(e) => handleKeyDown(e, handleTravelHistoryClick)}
            role="button"
            tabIndex="0"
          >
            <div className="action-icon">
              <img src="/img2/time-history.png" alt="Travel History" />
            </div>
            <div className="action-text">Travel History</div>
          </div>
          <div 
            className="action-card" 
            onClick={handleReminderClick}
            onKeyDown={(e) => handleKeyDown(e, handleReminderClick)}
            role="button"
            tabIndex="0"
          >
            <div className="action-icon">
              <img src="/img2/闹钟.png" alt="Set Reminder" />
            </div>
            <div className="action-text">Set Reminder</div>
          </div>
        </div>
        
        {/* Frequent Routes */}
        <div className="frequent-routes">
          <h3 className="section-title">Frequent Routes</h3>
          <div className="route-cards">
            {routes.slice(0, 2).map(route => {
              const { from, to } = getRouteFromTo(route.name);
              return (
                <div className="route-card" key={route.id}>
                  <div className="route-card-header">
                    <div className="route-badge">{route.route_number}</div>
                    <div className="route-time">{route.estimated_time}</div>
                  </div>
                  <div className="route-card-content">
                    <div className="route-from-to">
                      <div className="route-from">{from}</div>
                      <div className="route-arrow">→</div>
                      <div className="route-to">{to}</div>
                    </div>
                    <div className="route-stops">{route.stops_count} stops • {route.duration} min</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Traffic Status */}
        <div className="traffic-status">
          <h3 className="section-title">Traffic Status</h3>
          {systemStatus.map(status => (
            <div className="status-card" key={status.id}>
              <div className="status-header">
                <div className="status-icon">
                  <img 
                    src={safeIncludes(status.name, 'Tram') ? '/img2/有轨电车.png' : '/img2/android-bus.png'} 
                    alt={status.name || 'Transport Status'} 
                  />
                </div>
                <div className="status-title">{status.name || 'Unknown Route'}</div>
                <div className={`status-indicator ${status.status || 'unknown'}`}>
                  {status.status === 'good' ? 'Good' : status.status === 'warning' ? 'Minor Delays' : 'Issues'}
                </div>
              </div>
              <div className="status-details">
                {status.details || 'No detailed information available'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 