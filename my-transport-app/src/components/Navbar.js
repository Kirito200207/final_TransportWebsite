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
  
  const handleKeyDown = (id, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onNavClick(id);
    }
  };
  
  return (
    <nav className="navbar">
      <ul>
        {navItems.map(item => (
          <li 
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''} ${activePage === item.id && isPageVisible ? 'expanded' : ''}`}
            onClick={() => onNavClick(item.id)}
            onKeyDown={(e) => handleKeyDown(item.id, e)}
            role="button"
            tabIndex={0}
          >
            <FontAwesomeIcon icon={item.icon} />
            <span className="nav-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar; 