import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faInfoCircle, faEnvelope, 
  faCog
} from '@fortawesome/free-solid-svg-icons';
import '../App.css';

const Navbar = ({ activePage, onNavClick, isPageVisible }) => {
  // Navigation menu items definition
  const navItems = [
    { id: 'home', icon: faHome, label: 'Home' },
    { id: 'message', icon: faEnvelope, label: 'Messages' },
    { id: 'info', icon: faInfoCircle, label: 'Info' },
    { id: 'setting', icon: faCog, label: 'Settings' },
  ];
  
  return (
    <nav className="navbar">
      <div className="nav-items-container">
        {navItems.map(item => (
          <button 
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''} ${activePage === item.id && isPageVisible ? 'expanded' : ''}`}
            onClick={() => onNavClick(item.id)}
            type="button"
          >
            <FontAwesomeIcon icon={item.icon} />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar; 