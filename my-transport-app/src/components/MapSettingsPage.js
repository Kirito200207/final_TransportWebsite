import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const MapSettingsPage = ({ isActive, onClose }) => {
  const [mapSettings, setMapSettings] = useState({
    default_map_type: 'normal', // Default map type: normal, satellite, hybrid
    auto_locate: true, // Auto locate
    show_traffic: false, // Show traffic
    show_bus_stops: true, // Show bus stops
    show_tram_stops: true, // Show tram stops
    night_mode: false, // Night mode
    map_zoom_level: 15, // Default zoom level
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get map settings
  useEffect(() => {
    if (isActive) {
      fetchMapSettings();
    }
  }, [isActive]);

  // Function to get user map settings
  const fetchMapSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMapSettings();
      console.log('Retrieved map settings:', response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        setMapSettings(response.data[0]);
      } else if (response.data && response.data.id) {
        setMapSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to get map settings:', err);
      setError('Unable to load map settings');
      // Use default settings
    } finally {
      setLoading(false);
    }
  };

  // Update map type setting
  const handleMapTypeChange = async (e) => {
    const newValue = e.target.value;
    try {
      setLoading(true);
      const updatedSettings = { ...mapSettings, default_map_type: newValue };
      await updateMapSettings(updatedSettings);
      
      // If map instance exists, apply changes immediately
      if (window.map) {
        if (newValue === 'normal') {
          window.map.setMapType(window.BMAP_NORMAL_MAP);
        } else if (newValue === 'satellite') {
          window.map.setMapType(window.BMAP_SATELLITE_MAP);
        } else if (newValue === 'hybrid') {
          window.map.setMapType(window.BMAP_HYBRID_MAP);
        }
      }
      
      console.log('Map type updated:', newValue);
    } catch (err) {
      console.error('Failed to update map type:', err);
      setError('Failed to update map type');
    } finally {
      setLoading(false);
    }
  };

  // Update boolean type settings
  const handleToggleSetting = async (settingName, e) => {
    const newValue = e.target.checked;
    try {
      setLoading(true);
      const updatedSettings = { ...mapSettings, [settingName]: newValue };
      await updateMapSettings(updatedSettings);
      
      // If map instance exists, apply changes immediately
      if (window.map) {
        applySettingToMap(settingName, newValue);
      }
      
      console.log(`${settingName} setting updated:`, newValue);
    } catch (err) {
      console.error(`Failed to update ${settingName} setting:`, err);
      // Restore original state
      e.target.checked = mapSettings[settingName];
      setError(`Failed to update ${settingName} setting`);
    } finally {
      setLoading(false);
    }
  };

  // Update zoom level
  const handleZoomLevelChange = async (e) => {
    const newValue = parseInt(e.target.value, 10);
    try {
      setLoading(true);
      const updatedSettings = { ...mapSettings, map_zoom_level: newValue };
      await updateMapSettings(updatedSettings);
      
      // If map instance exists, apply changes immediately
      if (window.map) {
        window.map.setZoom(newValue);
      }
      
      console.log('Map zoom level updated:', newValue);
    } catch (err) {
      console.error('Failed to update map zoom level:', err);
      setError('Failed to update map zoom level');
    } finally {
      setLoading(false);
    }
  };

  // Apply settings to map
  const applySettingToMap = (settingName, value) => {
    if (!window.map) return;
    
    switch(settingName) {
      case 'auto_locate':
        if (value && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            const point = new window.BMapGL.Point(position.coords.longitude, position.coords.latitude);
            window.map.centerAndZoom(point, mapSettings.map_zoom_level);
          });
        }
        break;
      case 'show_traffic':
        if (value) {
          window.map.setTrafficOn();
        } else {
          window.map.setTrafficOff();
        }
        break;
      case 'night_mode':
        if (value) {
          window.map.setMapStyleV2({style: 'midnight'});
        } else {
          window.map.setMapStyleV2({style: 'normal'});
        }
        break;
      case 'show_bus_stops':
      case 'show_tram_stops':
        // Need to reload markers here, specific implementation depends on the app's marker management
        // Simplified handling, just an example
        break;
      default:
        break;
    }
  };

  // Generic function to update map settings
  const updateMapSettings = async (updatedSettings) => {
    // If mapSettings has no id, backend hasn't created a settings record for the current user
    if (!mapSettings.id) {
      // Create new settings record
      await apiService.updateMapSettings(updatedSettings);
      // Retrieve settings again to get id
      await fetchMapSettings();
    } else {
      // Update existing settings
      await apiService.updateMapSettings(updatedSettings);
      setMapSettings(updatedSettings);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (action, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  if (!isActive) return null;

  return (
    <div id="mapSettingsPage" className="page-content active" style={{ height: 'auto' }}>
      <div className="settings-container">
        <div className="settings-header">
          <button 
            className="back-button" 
            onClick={onClose}
            onKeyDown={(e) => handleKeyDown(onClose, e)}
            aria-label="Return to settings page"
          >
            ‹ Back
          </button>
          <h2 className="settings-title">Map Settings</h2>
        </div>
        
        {loading && <div className="settings-loading">Loading...</div>}
        
        {error && (
          <div className="settings-error">
            {error}
          </div>
        )}
        
        <div className="settings-section">
          <h3 className="section-title">Map Display</h3>
          
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/map-type.png" alt="Map Type" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Map Type</div>
              <div className="setting-select">
                <select 
                  value={mapSettings.default_map_type} 
                  onChange={handleMapTypeChange}
                  disabled={loading}
                  aria-label="Select map type"
                >
                  <option value="normal">Standard Map</option>
                  <option value="satellite">Satellite Map</option>
                  <option value="hybrid">Hybrid Map</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/night-mode.png" alt="Night Mode" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Night Mode</div>
              <div className="setting-toggle">
                <label className="switch" htmlFor="nightModeToggle">
                  <span className="visually-hidden">Enable night mode</span>
                  <input 
                    id="nightModeToggle"
                    type="checkbox" 
                    checked={mapSettings.night_mode || false} 
                    onChange={(e) => handleToggleSetting('night_mode', e)}
                    disabled={loading}
                    aria-label="Enable night mode"
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/定位.png" alt="Auto Locate" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Auto Locate</div>
              <div className="setting-toggle">
                <label className="switch" htmlFor="autoLocateToggle">
                  <span className="visually-hidden">Enable auto locate</span>
                  <input 
                    id="autoLocateToggle"
                    type="checkbox" 
                    checked={mapSettings.auto_locate || false} 
                    onChange={(e) => handleToggleSetting('auto_locate', e)}
                    disabled={loading}
                    aria-label="Enable auto locate"
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">Traffic Information</h3>
          
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/通用-路况交通.png" alt="Traffic Conditions" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Show Traffic Conditions</div>
              <div className="setting-toggle">
                <label className="switch" htmlFor="trafficToggle">
                  <span className="visually-hidden">Show traffic conditions</span>
                  <input 
                    id="trafficToggle"
                    type="checkbox" 
                    checked={mapSettings.show_traffic || false} 
                    onChange={(e) => handleToggleSetting('show_traffic', e)}
                    disabled={loading}
                    aria-label="Show traffic conditions"
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/公共交通 (1) 1.png" alt="Bus Stops" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Show Bus Stops</div>
              <div className="setting-toggle">
                <label className="switch" htmlFor="busStopsToggle">
                  <span className="visually-hidden">Show bus stops</span>
                  <input 
                    id="busStopsToggle"
                    type="checkbox" 
                    checked={mapSettings.show_bus_stops || false} 
                    onChange={(e) => handleToggleSetting('show_bus_stops', e)}
                    disabled={loading}
                    aria-label="Show bus stops"
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/有轨电车.png" alt="Tram Stops" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Show Tram Stops</div>
              <div className="setting-toggle">
                <label className="switch" htmlFor="tramStopsToggle">
                  <span className="visually-hidden">Show tram stops</span>
                  <input 
                    id="tramStopsToggle"
                    type="checkbox" 
                    checked={mapSettings.show_tram_stops || false} 
                    onChange={(e) => handleToggleSetting('show_tram_stops', e)}
                    disabled={loading}
                    aria-label="Show tram stops"
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">Zoom Settings</h3>
          
          <div className="setting-item">
            <div className="setting-icon">
              <img src="/img2/Zoom.png" alt="Default Zoom Level" className="icon-small" />
            </div>
            <div className="setting-content">
              <div className="setting-label">Default Zoom Level: {mapSettings.map_zoom_level}</div>
              <div className="setting-range">
                <input 
                  type="range" 
                  min="3" 
                  max="19" 
                  value={mapSettings.map_zoom_level} 
                  onChange={handleZoomLevelChange}
                  disabled={loading}
                  aria-label="Set default zoom level"
                />
                <div className="range-labels">
                  <span>Far</span>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSettingsPage; 