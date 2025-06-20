import React, { useState, useEffect } from 'react';
import './App.css';
import MapContainer from './components/MapContainer';
import SearchBox from './components/SearchBox';
import HomePage from './components/HomePage';
import InfoPage from './components/InfoPage';
import MessagePage from './components/MessagePage';
import SettingPage from './components/SettingPage';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import RegisterPage from './components/RegisterPage';
import PlanTripPage from './components/PlanTripPage';
import ReminderPage from './components/ReminderPage';
import NearbyStopsPage from './components/NearbyStopsPage';
import TravelHistoryPage from './components/TravelHistoryPage';
import Navbar from './components/Navbar';
import MapToggleHint from './components/MapToggleHint';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAuthPage, setCurrentAuthPage] = useState('login');
  const [showReminderPage, setShowReminderPage] = useState(false);
  const [showNearbyStopsPage, setShowNearbyStopsPage] = useState(false);
  const [showTravelHistoryPage, setShowTravelHistoryPage] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check user login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setCurrentUser(user);
        console.log('User login status restored from local storage:', user);
      } catch (err) {
        console.error('Error parsing user information:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Handle navigation clicks
  const handleNavClick = (page) => {
    if (page === activePage) {
      // If clicking the current active page, toggle show/hide state
      setIsPageVisible(!isPageVisible);
    } else {
      // If clicking another page, switch to that page and show it
      setActivePage(page);
      setIsPageVisible(true);
    }
    // Hide all overlay pages when clicking nav items
    setShowReminderPage(false);
    setShowNearbyStopsPage(false);
    setShowTravelHistoryPage(false);
  };

  // Handle navigation from HomePage
  const handleHomeNavigation = (page) => {
    if (page === 'reminder') {
      setShowReminderPage(true);
    } else if (page === 'plantrip') {
      setActivePage('planTrip');
      setIsPageVisible(true);
    } else if (page === 'nearbystops') {
      setShowNearbyStopsPage(true);
    } else if (page === 'travelhistory') {
      setShowTravelHistoryPage(true);
    }
  };

  // Handle login
  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    console.log('User login successful:', user);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentAuthPage('login');
    console.log('User logged out');
  };

  // Switch to forgot password page
  const goToForgotPassword = () => {
    setCurrentAuthPage('forgotPassword');
  };

  // Switch to register page
  const goToRegister = () => {
    setCurrentAuthPage('register');
  };

  // Return to login page
  const goToLogin = () => {
    setCurrentAuthPage('login');
  };

  // 判断是否应该显示搜索框
  const shouldShowSearchBox = () => {
    // 当任何主要页面（home, message, info, setting）可见时，不显示搜索框
    if (isPageVisible && ['home', 'message', 'info', 'setting'].includes(activePage)) {
      return false;
    }
    
    // 当特殊页面显示时，不显示搜索框
    if (showReminderPage || showNearbyStopsPage || showTravelHistoryPage || activePage === 'planTrip') {
      return false;
    }
    
    // 其他情况下显示搜索框
    return true;
  };

  if (!isLoggedIn) {
    // Not logged in, display login/register/forgot password page
    return (
      <div className="App">
        {currentAuthPage === 'login' && (
          <LoginPage 
            onLogin={handleLogin} 
            onForgotPassword={goToForgotPassword}
            onRegister={goToRegister}
          />
        )}
        {currentAuthPage === 'forgotPassword' && (
          <ForgotPasswordPage onBack={goToLogin} />
        )}
        {currentAuthPage === 'register' && (
          <RegisterPage onBack={goToLogin} onRegisterSuccess={goToLogin} />
        )}
      </div>
    );
  }

  // Logged in, display main app
  return (
    <div className="App">
      <MapContainer />
      {shouldShowSearchBox() && <SearchBox />}
      
      {/* Only show page content when isPageVisible is true */}
      {isPageVisible && (
        <>
          <HomePage 
            isActive={activePage === 'home'} 
            onNavigate={handleHomeNavigation} 
          />
          <InfoPage isActive={activePage === 'info'} />
          <MessagePage isActive={activePage === 'message'} />
          <PlanTripPage 
            isActive={activePage === 'planTrip'} 
            onClose={() => {
              setActivePage('home');
              setIsPageVisible(true);
            }}
          />
          <SettingPage 
            isActive={activePage === 'setting'} 
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        </>
      )}
      
      {/* Reminder Page can be shown on top of any page */}
      <ReminderPage 
        isActive={activePage === 'reminder' || showReminderPage}
        onClose={() => {
          if (showReminderPage) {
            setShowReminderPage(false);
          }
        }}
      />
      
      {/* Nearby Stops Page can be shown on top of any page */}
      <NearbyStopsPage 
        isActive={activePage === 'nearbystops' || showNearbyStopsPage}
        onClose={() => {
          if (showNearbyStopsPage) {
            setShowNearbyStopsPage(false);
          }
        }}
      />
      
      {/* Travel History Page can be shown on top of any page */}
      <TravelHistoryPage 
        isActive={activePage === 'travelhistory' || showTravelHistoryPage}
        onClose={() => {
          if (showTravelHistoryPage) {
            setShowTravelHistoryPage(false);
          }
        }}
      />
      
      {/* Map toggle hint */}
      <MapToggleHint isPageVisible={isPageVisible} activePage={activePage} />
      
      <Navbar 
        activePage={activePage} 
        onNavClick={handleNavClick} 
        isPageVisible={isPageVisible}
      />
    </div>
  );
}

export default App; 