import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExchangeAlt, 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faClock,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const PlanTripPage = ({ isActive, onClose }) => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [departureTime, setDepartureTime] = useState('now');
  const [customTime, setCustomTime] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [preferredTransport, setPreferredTransport] = useState('all');
  const [routeOptions, setRouteOptions] = useState([]);
  const [recentLocations, setRecentLocations] = useState([]);
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 模拟数据
  const mockData = {
    recentLocations: [
      { id: 1, name: 'Home', address: '123 Main St' },
      { id: 2, name: 'Office', address: '456 Work Ave' },
      { id: 3, name: 'Shopping Mall', address: '789 Shopping Blvd' }
    ],
    favoriteLocations: [
      { id: 1, name: 'Home', address: '123 Main St', icon: '🏠' },
      { id: 2, name: 'Office', address: '456 Work Ave', icon: '🏢' },
      { id: 3, name: 'Gym', address: '555 Fitness Road', icon: '🏋️' }
    ],
    routeOptions: [
      {
        id: 1,
        duration: 25,
        transfers: 0,
        departure: '14:05',
        arrival: '14:30',
        price: '3.50',
        steps: [
          { type: 'walk', duration: 5, description: 'Walk to Station A' },
          { type: 'tram', line: 'T5', duration: 15, stops: 4, description: 'Take Tram T5 to Station B' },
          { type: 'walk', duration: 5, description: 'Walk to destination' }
        ]
      },
      {
        id: 2,
        duration: 30,
        transfers: 1,
        departure: '14:10',
        arrival: '14:40',
        price: '3.00',
        steps: [
          { type: 'walk', duration: 3, description: 'Walk to Bus Stop 1' },
          { type: 'bus', line: '123', duration: 12, stops: 3, description: 'Take Bus 123 to Transfer Point' },
          { type: 'bus', line: '456', duration: 10, stops: 2, description: 'Take Bus 456 to Bus Stop 2' },
          { type: 'walk', duration: 5, description: 'Walk to destination' }
        ]
      },
      {
        id: 3,
        duration: 20,
        transfers: 0,
        departure: '14:15',
        arrival: '14:35',
        price: '4.50',
        steps: [
          { type: 'walk', duration: 2, description: 'Walk to Express Station' },
          { type: 'tram', line: 'TX', duration: 15, stops: 2, description: 'Take Express Tram to Express Station 2' },
          { type: 'walk', duration: 3, description: 'Walk to destination' }
        ]
      }
    ]
  };

  useEffect(() => {
    if (isActive) {
      loadSavedLocations();
    }
  }, [isActive]);

  const loadSavedLocations = async () => {
    // 在实际应用中，这些数据应该从API获取
    setRecentLocations(mockData.recentLocations);
    setFavoriteLocations(mockData.favoriteLocations);
    
    try {
      // 如果API已经可用，尝试获取实际数据
      const recentRes = await apiService.getRecentLocations();
      const favoritesRes = await apiService.getFavoriteLocations();
      
      if (recentRes && recentRes.data) {
        setRecentLocations(recentRes.data);
      }
      
      if (favoritesRes && favoritesRes.data) {
        setFavoriteLocations(favoritesRes.data);
      }
    } catch (err) {
      console.log('Using mock location data');
    }
  };

  const handlePlanTrip = () => {
    if (!fromLocation || !toLocation) {
      setError('Please enter both origin and destination');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // 模拟API请求延迟
    setTimeout(() => {
      try {
        // 使用模拟数据
        setRouteOptions(mockData.routeOptions);
        setLoading(false);
        
        // 在实际应用中，这里应该调用API
        // const params = {
        //   from: fromLocation,
        //   to: toLocation,
        //   time: departureTime === 'custom' ? `${customDate} ${customTime}` : 'now',
        //   transport: preferredTransport
        // };
        // apiService.planTrip(params).then(res => {
        //   setRouteOptions(res.data);
        //   setLoading(false);
        // }).catch(err => {
        //   setError('Failed to plan trip. Please try again.');
        //   setLoading(false);
        // });
      } catch (err) {
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };

  const handleLocationSelect = (location, type) => {
    if (type === 'from') {
      setFromLocation(location.name);
    } else {
      setToLocation(location.name);
    }
  };

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const formatTimeLabel = (time) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(`2000-01-01T${time}`).toLocaleTimeString(undefined, options);
  };

  // 渲染单个路线步骤
  const renderRouteStep = (step, index) => {
    const stepIconMap = {
      'walk': '/img2/步行.png',
      'tram': '/img2/有轨电车.png',
      'bus': '/img2/android-bus.png'
    };
    
    return (
      <div className="route-step" key={index}>
        <div className="step-icon">
          <img src={stepIconMap[step.type]} alt={step.type} />
        </div>
        <div className="step-details">
          <div className="step-description">
            {step.type !== 'walk' && 
              <span className="line-badge">{step.line}</span>
            }
            {step.description}
          </div>
          <div className="step-duration">
            {step.duration} min
            {step.stops && ` • ${step.stops} stops`}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="planTripPage" className={`page-content home-style-page ${isActive ? 'active' : ''}`}>
      <div className="plan-trip-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="page-title">Plan Your Trip</h2>
          {onClose && (
            <button 
              className="close-button" 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                color: '#4a5568',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        
        {/* 路线规划表单 */}
        <div className="trip-planner-form">
          <div className="location-inputs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="input-group" style={{ flex: '0.45' }}>
              <label htmlFor="fromLocation">From</label>
              <input
                type="text"
                id="fromLocation"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder="Enter origin"
              />
            </div>
            
            <button className="swap-button" onClick={handleSwapLocations} aria-label="Swap locations" style={{ flexShrink: 0, position: 'relative', right: '-12px', bottom: '-14px' }}>
              <img src="/img2/置换.png" alt="Swap" />
            </button>
            
            <div className="input-group" style={{ flex: '0.45' }}>
              <label htmlFor="toLocation">To</label>
              <input
                type="text"
                id="toLocation"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder="Enter destination"
              />
            </div>
          </div>
          
          <div className="time-options">
            <div className="radio-group">
              <input
                type="radio"
                id="timeNow"
                name="departureTime"
                value="now"
                checked={departureTime === 'now'}
                onChange={() => setDepartureTime('now')}
              />
              <label htmlFor="timeNow">Leave now</label>
            </div>
            
            <div className="radio-group">
              <input
                type="radio"
                id="timeCustom"
                name="departureTime"
                value="custom"
                checked={departureTime === 'custom'}
                onChange={() => setDepartureTime('custom')}
              />
              <label htmlFor="timeCustom">Schedule</label>
            </div>
          </div>
          
          {departureTime === 'custom' && (
            <div className="custom-time-inputs">
              <div className="input-group">
                <label htmlFor="customDate">Date</label>
                <input
                  type="date"
                  id="customDate"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="customTime">Time</label>
                <input
                  type="time"
                  id="customTime"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="transport-preference">
            <label htmlFor="preferredTransport">Preferred transport</label>
            <div className="transport-options" id="preferredTransport">
              <button 
                className={`transport-option ${preferredTransport === 'all' ? 'active' : ''}`}
                onClick={() => setPreferredTransport('all')}
              >
                <span className="transport-icon">🚍</span>
                <span>All</span>
              </button>
              
              <button 
                className={`transport-option ${preferredTransport === 'tram' ? 'active' : ''}`}
                onClick={() => setPreferredTransport('tram')}
              >
                <span className="transport-icon">🚋</span>
                <span>Tram</span>
              </button>
              
              <button 
                className={`transport-option ${preferredTransport === 'bus' ? 'active' : ''}`}
                onClick={() => setPreferredTransport('bus')}
              >
                <span className="transport-icon">🚌</span>
                <span>Bus</span>
              </button>
            </div>
          </div>
          
          <button className="plan-trip-button" onClick={handlePlanTrip}>
            Find Routes
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </div>
        
        {/* 保存的位置 */}
        <div className="saved-locations">
          <div className="locations-section">
            <h3 className="section-title">Favorite Places</h3>
            <div className="location-cards">
              {favoriteLocations.map(location => (
                <div className="location-card" key={location.id}>
                  <div className="location-icon">{location.icon}</div>
                  <div className="location-details">
                    <div className="location-name">{location.name}</div>
                    <div className="location-address">{location.address}</div>
                  </div>
                  <div className="location-actions">
                    <button onClick={() => handleLocationSelect(location, 'from')}>From</button>
                    <button onClick={() => handleLocationSelect(location, 'to')}>To</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="locations-section">
            <h3 className="section-title">Recent Places</h3>
            <div className="location-cards">
              {recentLocations.map(location => (
                <div className="location-card" key={location.id}>
                  <div className="location-details">
                    <div className="location-name">{location.name}</div>
                    <div className="location-address">{location.address}</div>
                  </div>
                  <div className="location-actions">
                    <button onClick={() => handleLocationSelect(location, 'from')}>From</button>
                    <button onClick={() => handleLocationSelect(location, 'to')}>To</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 路线选项结果 */}
        {loading && <div className="loading-indicator">Finding the best routes...</div>}
        
        {routeOptions.length > 0 && !loading && (
          <div className="route-options">
            <h3 className="section-title">Route Options</h3>
            
            <div className="route-cards">
              {routeOptions.map(route => (
                <div className="route-card expanded" key={route.id}>
                  <div className="route-card-header">
                    <div className="route-overview">
                      <div className="route-duration">{route.duration} min</div>
                      <div className="route-transfers">
                        {route.transfers === 0 ? 'Direct' : `${route.transfers} transfer${route.transfers > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <div className="route-times">
                      <div className="departure-time">{formatTimeLabel(route.departure)}</div>
                      <div className="time-arrow">→</div>
                      <div className="arrival-time">{formatTimeLabel(route.arrival)}</div>
                    </div>
                    <div className="route-price">${route.price}</div>
                  </div>
                  
                  <div className="route-card-details">
                    {route.steps.map((step, index) => renderRouteStep(step, index))}
                  </div>
                  
                  <div className="route-card-actions">
                    <button className="action-button">
                      <img src="/img2/保存.png" alt="Save" />
                      <span>Save</span>
                    </button>
                    <button className="action-button">
                      <img src="/img2/share.png" alt="Share" />
                      <span>Share</span>
                    </button>
                    <button className="action-button primary">
                      <img src="/img2/方向.png" alt="Navigate" />
                      <span>Start</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanTripPage; 