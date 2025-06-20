# 前后端集成指南

本指南提供了如何将React前端与Django后端集成的步骤和最佳实践。

## 项目结构

项目分为两个主要部分：

1. **React前端**：位于项目根目录
2. **Django后端**：位于`transit_backend`目录

## 开发环境设置

### 启动后端服务器

```bash
cd transit_backend
python manage.py runserver
```

后端API将在 http://localhost:8000/api/ 上可用。

### 启动前端开发服务器

```bash
npm start
```

前端将在 http://localhost:3000 上运行。

## API集成

### 配置API基础URL

在前端项目中创建一个API服务文件：

```jsx
// src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

export const fetchTransportTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/transport-types/`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transport types:', error);
    throw error;
  }
};

export const fetchRoutes = async (transportTypeId = null) => {
  try {
    let url = `${API_BASE_URL}/routes/`;
    if (transportTypeId) {
      url += `?transport_type=${transportTypeId}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};

export const fetchNearbyStops = async (lat, lng, radius = 1.0) => {
  try {
    const url = `${API_BASE_URL}/stops/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching nearby stops:', error);
    throw error;
  }
};

export const fetchNextArrivals = async (routeId, stopId) => {
  try {
    const url = `${API_BASE_URL}/schedules/next_arrivals/?route=${routeId}&stop=${stopId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching next arrivals:', error);
    throw error;
  }
};

export const fetchSystemStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/system-status/current/`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching system status:', error);
    throw error;
  }
};

// 用户认证相关API
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // 包含cookies
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      credentials: 'include', // 包含cookies
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// 其他API方法...
```

### 在组件中使用API

```jsx
// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import { fetchTransportTypes, fetchSystemStatus } from '../services/api';

function HomePage() {
  const [transportTypes, setTransportTypes] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [typesData, statusData] = await Promise.all([
          fetchTransportTypes(),
          fetchSystemStatus()
        ]);
        
        setTransportTypes(typesData);
        setSystemStatus(statusData);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="home-page">
      <h1>Transit System</h1>
      
      <h2>Transport Types</h2>
      <div className="transport-types">
        {transportTypes.map(type => (
          <div key={type.id} className="transport-type">
            <img src={type.icon} alt={type.name} />
            <span>{type.name}</span>
          </div>
        ))}
      </div>
      
      <h2>System Status</h2>
      <div className="system-status">
        {systemStatus && systemStatus.statuses.map(status => (
          <div key={status.id} className={`status-item ${status.status}`}>
            <h3>{status.transport_type_details.name}</h3>
            <p>{status.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
```

## 认证与授权

### 处理用户会话

创建一个认证上下文来管理用户状态：

```jsx
// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchUserProfile, login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const userData = await fetchUserProfile();
        setCurrentUser(userData);
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      await apiLogin(username, password);
      const userData = await fetchUserProfile();
      setCurrentUser(userData);
      return true;
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      await apiRegister(userData);
      return true;
    } catch (err) {
      setError('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
```

### 在应用中使用认证上下文

```jsx
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import SettingPage from './components/SettingPage';
import MessagePage from './components/MessagePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <SettingPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <PrivateRoute>
                <MessagePage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

```jsx
// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
```

## CORS配置

Django后端已经配置了CORS支持，允许来自前端开发服务器的请求。在生产环境中，应该更新`settings.py`中的CORS配置，只允许特定的域名：

```python
# transit_backend/transit_backend/settings.py

# 开发环境
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    # 生产环境
    CORS_ALLOWED_ORIGINS = [
        "https://your-production-domain.com",
    ]
```

## 部署注意事项

### 前端部署

1. 构建生产版本：
   ```bash
   npm run build
   ```

2. 将构建文件夹(`build/`)部署到静态文件服务器或CDN

### 后端部署

1. 更新Django设置：
   ```python
   # transit_backend/transit_backend/settings.py
   DEBUG = False
   ALLOWED_HOSTS = ['your-api-domain.com']
   
   # 设置静态文件目录
   STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
   ```

2. 收集静态文件：
   ```bash
   python manage.py collectstatic
   ```

3. 使用生产级Web服务器（如Nginx）和WSGI服务器（如Gunicorn）部署Django应用

4. 设置HTTPS

## 常见问题

### 跨域请求问题

如果遇到CORS错误，确保：
1. Django CORS中间件已正确配置
2. 前端请求包含正确的凭据（`credentials: 'include'`）
3. 后端允许来自前端域的请求

### 认证问题

如果用户无法保持登录状态：
1. 确保前端请求包含凭据（`credentials: 'include'`）
2. 检查Django会话配置
3. 确保没有禁用cookies

### API错误处理

在前端代码中实现一致的错误处理：

```jsx
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    
    if (response.status === 401) {
      // 未授权，重定向到登录页面
      window.location.href = '/login';
      return;
    }
    
    if (!response.ok) {
      // 解析错误消息
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    // 显示用户友好的错误消息
    // ...
    throw error;
  }
};
```