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
import Navbar from './components/Navbar';
import MapToggleHint from './components/MapToggleHint';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAuthPage, setCurrentAuthPage] = useState('login');

  // 检查用户登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // 处理导航点击
  const handleNavClick = (page) => {
    if (page === activePage) {
      // 如果点击的是当前激活页面，则切换显示/隐藏状态
      setIsPageVisible(!isPageVisible);
    } else {
      // 如果点击的是其他页面，则切换到该页面并显示
      setActivePage(page);
      setIsPageVisible(true);
    }
  };

  // 处理登录
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentAuthPage('login');
  };

  // 切换到忘记密码页面
  const goToForgotPassword = () => {
    setCurrentAuthPage('forgotPassword');
  };

  // 切换到注册页面
  const goToRegister = () => {
    setCurrentAuthPage('register');
  };

  // 返回登录页面
  const goToLogin = () => {
    setCurrentAuthPage('login');
  };

  if (!isLoggedIn) {
    // 未登录状态，显示登录/注册/找回密码页面
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

  // 已登录状态，显示主应用
  return (
    <div className="App">
      <MapContainer />
      <SearchBox />
      
      {/* 只有当isPageVisible为true时才显示页面内容 */}
      {isPageVisible && (
        <>
          <HomePage isActive={activePage === 'home'} />
          <InfoPage isActive={activePage === 'info'} />
          <MessagePage isActive={activePage === 'message'} />
          <SettingPage 
            isActive={activePage === 'setting'} 
            onLogout={handleLogout}
          />
        </>
      )}
      
      {/* 地图切换提示 */}
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
