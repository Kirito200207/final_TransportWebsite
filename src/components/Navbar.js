import React from 'react';

const Navbar = ({ activePage, onNavClick, isPageVisible }) => {
  return (
    <div className="navbar">
      <div 
        className={`nav-item ${activePage === 'home' ? 'active' : ''} ${activePage === 'home' && !isPageVisible ? 'map-visible' : ''}`}
        onClick={() => onNavClick('home')}
      >
        <img src="/img2/公共交通.png" className="nav-icon" alt="Home" />
        <span className="nav-text">Home</span>
      </div>
      <div 
        className={`nav-item ${activePage === 'info' ? 'active' : ''} ${activePage === 'info' && !isPageVisible ? 'map-visible' : ''}`}
        onClick={() => onNavClick('info')}
      >
        <img src="/img2/统计.png" className="nav-icon" alt="Info" />
        <span className="nav-text">Info</span>
      </div>
      <div 
        className={`nav-item ${activePage === 'message' ? 'active' : ''} ${activePage === 'message' && !isPageVisible ? 'map-visible' : ''}`}
        onClick={() => onNavClick('message')}
      >
        <img src="/img2/提示 (1).png" className="nav-icon" alt="Messages" />
        <span className="nav-text">Messages</span>
      </div>
      <div 
        className={`nav-item ${activePage === 'setting' ? 'active' : ''} ${activePage === 'setting' && !isPageVisible ? 'map-visible' : ''}`}
        onClick={() => onNavClick('setting')}
      >
        <img src="/img2/设置.png" className="nav-icon" alt="Settings" />
        <span className="nav-text">Settings</span>
      </div>
    </div>
  );
};

export default Navbar; 