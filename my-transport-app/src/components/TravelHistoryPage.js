import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHistory, faRoute, faCalendarAlt, faClock, 
  faTimes as faClose, faChevronDown, faChevronUp,
  faFilter, faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

const TravelHistoryPage = ({ isActive, onClose }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [dateRange, setDateRange] = useState('week');
  
  // Mock data for travel history
  const mockTrips = [
    {
      id: 1,
      date: "2023-06-10",
      time: "08:15",
      from: "Home",
      to: "Office",
      duration: 28,
      distance: 5.2,
      cost: 3.50,
      transport: "tram",
      route: "T5",
      steps: [
        { type: 'walk', duration: 5, description: 'Walk to Central Station' },
        { type: 'tram', line: 'T5', duration: 18, stops: 4, description: 'Take Tram T5 to Business District' },
        { type: 'walk', duration: 5, description: 'Walk to Office' }
      ]
    },
    {
      id: 2,
      date: "2023-06-10",
      time: "17:45",
      from: "Office",
      to: "Gym",
      duration: 22,
      distance: 3.8,
      cost: 2.50,
      transport: "bus",
      route: "B7",
      steps: [
        { type: 'walk', duration: 3, description: 'Walk to Business District Stop' },
        { type: 'bus', line: 'B7', duration: 15, stops: 3, description: 'Take Bus B7 to Sports Center' },
        { type: 'walk', duration: 4, description: 'Walk to Gym' }
      ]
    },
    {
      id: 3,
      date: "2023-06-10",
      time: "19:30",
      from: "Gym",
      to: "Home",
      duration: 25,
      distance: 4.5,
      cost: 3.00,
      transport: "bus",
      route: "B3",
      steps: [
        { type: 'walk', duration: 4, description: 'Walk to Sports Center Stop' },
        { type: 'bus', line: 'B3', duration: 18, stops: 5, description: 'Take Bus B3 to Residential Area' },
        { type: 'walk', duration: 3, description: 'Walk to Home' }
      ]
    },
    {
      id: 4,
      date: "2023-06-09",
      time: "10:15",
      from: "Home",
      to: "Shopping Mall",
      duration: 35,
      distance: 7.2,
      cost: 4.00,
      transport: "tram",
      route: "T3",
      steps: [
        { type: 'walk', duration: 5, description: 'Walk to Local Station' },
        { type: 'tram', line: 'T3', duration: 25, stops: 6, description: 'Take Tram T3 to Shopping District' },
        { type: 'walk', duration: 5, description: 'Walk to Shopping Mall' }
      ]
    },
    {
      id: 5,
      date: "2023-06-09",
      time: "15:45",
      from: "Shopping Mall",
      to: "City Park",
      duration: 20,
      distance: 2.8,
      cost: 2.50,
      transport: "bus",
      route: "B8",
      steps: [
        { type: 'walk', duration: 3, description: 'Walk to Shopping District Stop' },
        { type: 'bus', line: 'B8', duration: 12, stops: 3, description: 'Take Bus B8 to Park Entrance' },
        { type: 'walk', duration: 5, description: 'Walk to City Park' }
      ]
    },
    {
      id: 6,
      date: "2023-06-08",
      time: "09:30",
      from: "Home",
      to: "Library",
      duration: 18,
      distance: 3.2,
      cost: 2.50,
      transport: "bus",
      route: "B8",
      steps: [
        { type: 'walk', duration: 4, description: 'Walk to Local Stop' },
        { type: 'bus', line: 'B8', duration: 10, stops: 2, description: 'Take Bus B8 to Education Center' },
        { type: 'walk', duration: 4, description: 'Walk to Library' }
      ]
    }
  ];
  
  useEffect(() => {
    if (isActive) {
      loadTravelHistory();
    }
  }, [isActive, dateRange, filter]);
  
  const loadTravelHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call with filters
      // const response = await apiService.getTravelHistory({
      //   dateRange: dateRange,
      //   transportType: filter !== 'all' ? filter : undefined
      // });
      // setTrips(response.data);
      
      // Using mock data instead
      setTimeout(() => {
        // Filter mock data based on selected filters
        let filteredTrips = [...mockTrips];
        
        // Filter by transport type
        if (filter !== 'all') {
          filteredTrips = filteredTrips.filter(trip => trip.transport === filter);
        }
        
        // Filter by date range
        const today = new Date();
        let cutoffDate = new Date();
        
        switch (dateRange) {
          case 'today':
            // Only today's trips
            filteredTrips = filteredTrips.filter(trip => {
              const tripDate = new Date(trip.date);
              return tripDate.toDateString() === today.toDateString();
            });
            break;
          case 'week':
            // Last 7 days
            cutoffDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            // Last 30 days
            cutoffDate.setDate(today.getDate() - 30);
            break;
          case 'year':
            // Last 365 days
            cutoffDate.setDate(today.getDate() - 365);
            break;
          default:
            // All trips
            break;
        }
        
        if (dateRange !== 'today' && dateRange !== 'all') {
          filteredTrips = filteredTrips.filter(trip => {
            const tripDate = new Date(trip.date);
            return tripDate >= cutoffDate;
          });
        }
        
        setTrips(filteredTrips);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError("Failed to load travel history");
      setLoading(false);
    }
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };
  
  const toggleTripDetails = (tripId) => {
    if (expandedTrip === tripId) {
      setExpandedTrip(null);
    } else {
      setExpandedTrip(tripId);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const renderTransportIcon = (transportType, routeId) => {
    const isTram = transportType === 'tram';
    const bgColor = isTram ? '#3498db' : '#e74c3c';
    
    return (
      <span 
        className="transport-icon" 
        style={{ 
          backgroundColor: bgColor,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          display: 'inline-block'
        }}
      >
        {routeId}
      </span>
    );
  };
  
  const renderTripStep = (step, index) => {
    const stepIconMap = {
      'walk': '/img2/步行.png',
      'tram': '/img2/有轨电车.png',
      'bus': '/img2/android-bus.png'
    };
    
    return (
      <div 
        key={index} 
        className="trip-step"
        style={{
          display: 'flex',
          padding: '8px 0',
          borderBottom: index < step.length - 1 ? '1px solid #f1f1f1' : 'none'
        }}
      >
        <div className="step-icon" style={{ marginRight: '10px' }}>
          <img 
            src={stepIconMap[step.type]} 
            alt={step.type} 
            style={{ width: '24px', height: '24px' }}
          />
        </div>
        <div className="step-details" style={{ flex: 1 }}>
          <div className="step-description">
            {step.type !== 'walk' && 
              <span className="line-badge" style={{ marginRight: '5px', fontWeight: 'bold' }}>
                {step.line}
              </span>
            }
            {step.description}
          </div>
          <div className="step-duration" style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
            {step.duration} min
            {step.stops && ` • ${step.stops} stops`}
          </div>
        </div>
      </div>
    );
  };
  
  // Group trips by date for better organization
  const groupTripsByDate = () => {
    const grouped = {};
    
    trips.forEach(trip => {
      if (!grouped[trip.date]) {
        grouped[trip.date] = [];
      }
      grouped[trip.date].push(trip);
    });
    
    return grouped;
  };
  
  if (!isActive) return null;
  
  const groupedTrips = groupTripsByDate();
  
  return (
    <div id="travelHistoryPage" className={`page-content home-style-page ${isActive ? 'active' : ''}`}>
      <div className="travel-history-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div className="history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="page-title">Travel History</h2>
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
        
        {/* Filters */}
        <div className="history-filters" style={{ marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <div className="filter-section" style={{ marginBottom: '10px' }}>
            <div className="filter-label" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faFilter} style={{ marginRight: '8px', color: '#3498db' }} />
              <span style={{ fontWeight: '500' }}>Transport Type</span>
            </div>
            <div className="filter-options" style={{ display: 'flex', flexWrap: 'wrap' }}>
              {['all', 'tram', 'bus'].map(option => (
                <button 
                  key={option} 
                  onClick={() => handleFilterChange(option)}
                  style={{
                    padding: '6px 12px',
                    margin: '0 5px 5px 0',
                    backgroundColor: filter === option ? '#3498db' : '#f1f1f1',
                    color: filter === option ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {option === 'all' ? 'All' : option}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <div className="filter-label" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: '#3498db' }} />
              <span style={{ fontWeight: '500' }}>Time Period</span>
            </div>
            <div className="filter-options" style={{ display: 'flex', flexWrap: 'wrap' }}>
              {[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last 7 days' },
                { value: 'month', label: 'Last 30 days' },
                { value: 'year', label: 'Last year' },
                { value: 'all', label: 'All time' }
              ].map(option => (
                <button 
                  key={option.value} 
                  onClick={() => handleDateRangeChange(option.value)}
                  style={{
                    padding: '6px 12px',
                    margin: '0 5px 5px 0',
                    backgroundColor: dateRange === option.value ? '#3498db' : '#f1f1f1',
                    color: dateRange === option.value ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {loading && <div className="loading-indicator">Loading travel history...</div>}
        {error && <div className="error-message">{error}</div>}
        
        {/* Travel History List */}
        <div className="travel-history-list">
          {Object.keys(groupedTrips).length === 0 && !loading && (
            <div className="no-trips" style={{ textAlign: 'center', padding: '30px 0' }}>
              <FontAwesomeIcon icon={faHistory} style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '15px' }} />
              <p>No trips found for the selected filters.</p>
            </div>
          )}
          
          {Object.keys(groupedTrips).sort((a, b) => new Date(b) - new Date(a)).map(date => (
            <div key={date} className="date-group" style={{ marginBottom: '20px' }}>
              <div className="date-header" style={{ fontWeight: 'bold', marginBottom: '10px', padding: '5px 0', borderBottom: '1px solid #e2e8f0' }}>
                {formatDate(date)}
              </div>
              
              <div className="date-trips">
                {groupedTrips[date].map(trip => (
                  <div 
                    key={trip.id} 
                    className="trip-card"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                      padding: '16px',
                      marginBottom: '12px'
                    }}
                  >
                    <div 
                      className="trip-summary" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleTripDetails(trip.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleTripDetails(trip.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="trip-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div className="trip-route" style={{ display: 'flex', alignItems: 'center' }}>
                          {renderTransportIcon(trip.transport, trip.route)}
                          <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                            {trip.from} → {trip.to}
                          </span>
                        </div>
                        <div className="trip-time" style={{ color: '#718096' }}>
                          {trip.time}
                        </div>
                      </div>
                      
                      <div className="trip-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="trip-stats" style={{ display: 'flex', color: '#718096', fontSize: '0.9rem' }}>
                          <div style={{ marginRight: '15px' }}>
                            <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                            {trip.duration} min
                          </div>
                          <div style={{ marginRight: '15px' }}>
                            <FontAwesomeIcon icon={faRoute} style={{ marginRight: '5px' }} />
                            {trip.distance} km
                          </div>
                          <div>
                            ${trip.cost.toFixed(2)}
                          </div>
                        </div>
                        <div className="expand-button">
                          <FontAwesomeIcon 
                            icon={expandedTrip === trip.id ? faChevronUp : faChevronDown} 
                            style={{ color: '#718096' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded trip details */}
                    {expandedTrip === trip.id && (
                      <div className="trip-details" style={{ marginTop: '15px', borderTop: '1px solid #f1f1f1', paddingTop: '15px' }}>
                        <div className="trip-steps">
                          {trip.steps.map((step, index) => renderTripStep(step, index))}
                        </div>
                        
                        <div className="trip-actions" style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            className="repeat-trip-button"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 16px',
                              backgroundColor: '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginLeft: '8px'
                            }}
                          >
                            <FontAwesomeIcon icon={faRoute} style={{ marginRight: '5px' }} />
                            <span>Repeat Trip</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats summary */}
        {trips.length > 0 && (
          <div className="history-stats" style={{ marginTop: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: '0', marginBottom: '10px', fontSize: '1.1rem' }}>Summary</h3>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="stat-card" style={{ background: 'white', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>
                  {trips.length}
                </div>
                <div className="stat-label" style={{ fontSize: '0.9rem', color: '#718096' }}>
                  Total Trips
                </div>
              </div>
              <div className="stat-card" style={{ background: 'white', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>
                  {trips.reduce((total, trip) => total + trip.distance, 0).toFixed(1)}
                </div>
                <div className="stat-label" style={{ fontSize: '0.9rem', color: '#718096' }}>
                  Total Distance (km)
                </div>
              </div>
              <div className="stat-card" style={{ background: 'white', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>
                  ${trips.reduce((total, trip) => total + trip.cost, 0).toFixed(2)}
                </div>
                <div className="stat-label" style={{ fontSize: '0.9rem', color: '#718096' }}>
                  Total Spent
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelHistoryPage; 