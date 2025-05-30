import React, { useEffect, useState } from 'react';

const MapToggleHint = ({ isPageVisible, activePage }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // 当页面显示状态改变时显示提示
    if (isPageVisible) {
      setMessage(`${getPageName(activePage)} 页面已显示`);
    } else {
      setMessage('地图模式已启用');
    }
    
    // 显示提示
    setVisible(true);
    
    // 2秒后隐藏提示
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isPageVisible, activePage]);
  
  // 获取页面名称
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