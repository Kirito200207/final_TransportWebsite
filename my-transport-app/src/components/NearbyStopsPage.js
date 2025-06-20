import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLocationArrow, faRoute, faClock, faWalking, 
  faTimes as faClose 
} from '@fortawesome/free-solid-svg-icons';

const NearbyStopsPage = ({ isActive, onClose }) => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [radius, setRadius] = useState(500); // Default search radius in meters
  
  // Mock data for nearby stops
  const mockStops = [
    {
      id: 1,
      name: "Central Station",
      distance: 120,
      address: "Main Street",
      routes: ["T1", "T3", "B5"],
      nextDepartures: [
        { route: "T1", destination: "North Terminal", time: "5 min" },
        { route: "T3", destination: "East District", time: "8 min" },
        { route: "B5", destination: "Airport", time: "12 min" }
      ]
    },
    {
      id: 2,
      name: "Market Square",
      distance: 250,
      address: "Commerce Avenue",
      routes: ["T2", "B7"],
      nextDepartures: [
        { route: "T2", destination: "University", time: "3 min" },
        { route: "B7", destination: "Shopping Mall", time: "10 min" }
      ]
    },
    {
      id: 3,
      name: "City Park",
      distance: 350,
      address: "Green Street",
      routes: ["B3", "B8", "T5"],
      nextDepartures: [
        { route: "B3", destination: "Sports Center", time: "2 min" },
        { route: "B8", destination: "Library", time: "15 min" },
        { route: "T5", destination: "Beach", time: "18 min" }
      ]
    },
    {
      id: 4,
      name: "Hospital",
      distance: 480,
      address: "Health Boulevard",
      routes: ["B1", "T4"],
      nextDepartures: [
        { route: "B1", destination: "Downtown", time: "7 min" },
        { route: "T4", destination: "Residential Area", time: "11 min" }
      ]
    }
  ];
  
  useEffect(() => {
    if (isActive) {
      loadNearbyStops();
      getCurrentLocation();
    }
  }, [isActive]);
  
  const getCurrentLocation = () => {
    setLoading(true);
    
    // Simulate getting current location
    setTimeout(() => {
      setCurrentLocation({
        latitude: 40.7128,
        longitude: -74.0060,
        address: "Current Location"
      });
      setLoading(false);
    }, 1000);
    
    // In a real app, you would use the browser's geolocation API:
    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     setCurrentLocation({
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude
    //     });
    //     setLoading(false);
    //   },
    //   (error) => {
    //     setError("Unable to retrieve your location");
    //     setLoading(false);
    //   }
    // );
  };
  
  const loadNearbyStops = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call with the current location
      // const response = await apiService.getNearbyStops({
      //   latitude: currentLocation?.latitude,
      //   longitude: currentLocation?.longitude,
      //   radius: radius
      // });
      // setStops(response.data);
      
      // Using mock data instead
      setTimeout(() => {
        setStops(mockStops);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError("Failed to load nearby stops");
      setLoading(false);
    }
  };
  
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    loadNearbyStops();
  };
  
  const renderRouteIndicator = (routeId) => {
    const isTrainRoute = routeId.startsWith('T');
    const bgColor = isTrainRoute ? '#3498db' : '#e74c3c';
    
    return (
      <span 
        className="route-indicator" 
        style={{ 
          backgroundColor: bgColor,
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          marginRight: '4px',
          display: 'inline-block'
        }}
      >
        {routeId}
      </span>
    );
  };
  
  if (!isActive) return null;
  
  return (
    <div id="nearbyStopsPage" className={`page-content home-style-page ${isActive ? 'active' : ''}`}>
      <div className="nearby-stops-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div className="reminder-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="page-title">Nearby Stops</h2>
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
              <FontAwesomeIcon icon={faClose} />
            </button>
          )}
        </div>
        
        {/* Location and Filter */}
        <div className="location-info" style={{ marginBottom: '20px' }}>
          <div className="current-location" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <FontAwesomeIcon icon={faLocationArrow} style={{ marginRight: '10px', color: '#3498db' }} />
            <span>{currentLocation ? currentLocation.address : "Locating..."}</span>
          </div>
          
          <div className="radius-selector" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>Search radius:</span>
            <div className="radius-options" style={{ display: 'flex' }}>
              {[250, 500, 1000, 2000].map(r => (
                <button 
                  key={r} 
                  onClick={() => handleRadiusChange(r)}
                  style={{
                    padding: '5px 10px',
                    margin: '0 5px',
                    backgroundColor: radius === r ? '#3498db' : '#f1f1f1',
                    color: radius === r ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {r}m
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {loading && <div className="loading-indicator">Finding nearby stops...</div>}
        {error && <div className="error-message">{error}</div>}
        
        {/* Stops List */}
        <div className="stops-list">
          {stops.map(stop => (
            <div 
              key={stop.id} 
              className="stop-card"
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <div className="stop-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: '0', fontSize: '1.2rem' }}>{stop.name}</h3>
                <div className="stop-distance" style={{ display: 'flex', alignItems: 'center' }}>
                  <FontAwesomeIcon icon={faWalking} style={{ marginRight: '5px', color: '#7f8c8d' }} />
                  <span>{stop.distance}m</span>
                </div>
              </div>
              
              <div className="stop-address" style={{ marginBottom: '10px', color: '#7f8c8d' }}>
                {stop.address}
              </div>
              
              <div className="stop-routes" style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '5px', fontWeight: '500' }}>Routes:</div>
                <div>
                  {stop.routes.map(route => (
                    <span key={route} style={{ marginRight: '5px' }}>
                      {renderRouteIndicator(route)}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="next-departures">
                <div style={{ marginBottom: '5px', fontWeight: '500' }}>Next Departures:</div>
                <div className="departures-list">
                  {stop.nextDepartures.map((departure, index) => (
                    <div 
                      key={index} 
                      className="departure-item"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: index < stop.nextDepartures.length - 1 ? '1px solid #f1f1f1' : 'none'
                      }}
                    >
                      <div className="departure-route" style={{ display: 'flex', alignItems: 'center' }}>
                        {renderRouteIndicator(departure.route)}
                        <span style={{ marginLeft: '5px' }}>{departure.destination}</span>
                      </div>
                      <div className="departure-time" style={{ display: 'flex', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px', color: '#7f8c8d' }} />
                        <span>{departure.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="stop-actions" style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="route-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <FontAwesomeIcon icon={faRoute} style={{ marginRight: '5px' }} />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyStopsPage; 