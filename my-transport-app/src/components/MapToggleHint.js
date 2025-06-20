import React, { useEffect, useState } from 'react';

const MapToggleHint = ({ isPageVisible, activePage }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Show hint when page visibility changes
    if (isPageVisible) {
      setMessage(`${getPageName(activePage)} page is displayed`);
    } else {
      setMessage('Map mode is enabled');
    }
    
    // Show the hint
    setVisible(true);
    
    // Hide the hint after 2 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isPageVisible, activePage]);
  
  // Get page name
  const getPageName = (page) => {
    switch(page) {
      case 'home': return 'Home';
      case 'info': return 'Info';
      case 'message': return 'Messages';
      case 'setting': return 'Settings';
      default: return '';
    }
  };
  
  return (
    <div className={`map-toggle-hint ${visible ? 'visible' : ''}`}>
      {message}
    </div>
  );
};

export default MapToggleHint; 