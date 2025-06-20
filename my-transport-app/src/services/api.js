import axios from 'axios';

// API基础URL配置
const API_BASE_URL = 'http://localhost:8000/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允许跨域请求携带凭证(cookies)
});

// 获取CSRF令牌函数
const getCSRFToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// 请求拦截器 - 添加认证信息等
apiClient.interceptors.request.use(
  (config) => {
    // 添加CSRF令牌
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // 添加Token认证（如果存在）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 可以在这里处理登出逻辑
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 模拟数据
const mockData = {
  reminders: [
    {
      id: 1,
      title: 'Morning Commute',
      description: 'Daily commute to office',
      route: '1',
      from_stop: '1',
      to_stop: '2',
      reminder_time: '2023-06-10T07:30:00Z',
      advance_notice: 15,
      repeat_type: 'weekdays',
      repeat_days: '',
      status: 'active',
      created_at: '2023-06-01T10:00:00Z',
      updated_at: '2023-06-01T10:00:00Z',
      route_details: { id: 1, route_number: 'T5', name: 'North to South Line' },
      from_stop_details: { id: 1, name: 'Home Station', code: 'HS1' },
      to_stop_details: { id: 2, name: 'Office Station', code: 'OS1' }
    },
    {
      id: 2,
      title: 'Shopping Trip',
      description: 'Visit to the mall',
      route: '2',
      from_stop: '1',
      to_stop: '3',
      reminder_time: '2023-06-11T14:00:00Z',
      advance_notice: 20,
      repeat_type: 'once',
      repeat_days: '',
      status: 'active',
      created_at: '2023-06-02T09:30:00Z',
      updated_at: '2023-06-02T09:30:00Z',
      route_details: { id: 2, route_number: 'T3', name: 'East to West Line' },
      from_stop_details: { id: 1, name: 'Home Station', code: 'HS1' },
      to_stop_details: { id: 3, name: 'Mall Station', code: 'MS1' }
    },
    {
      id: 3,
      title: 'Weekend Park Visit',
      description: 'Trip to the central park',
      route: '3',
      from_stop: '1',
      to_stop: '4',
      reminder_time: '2023-06-12T10:00:00Z',
      advance_notice: 30,
      repeat_type: 'weekends',
      repeat_days: '',
      status: 'active',
      created_at: '2023-06-03T11:15:00Z',
      updated_at: '2023-06-03T11:15:00Z',
      route_details: { id: 3, route_number: 'B2', name: 'City Circle' },
      from_stop_details: { id: 1, name: 'Home Station', code: 'HS1' },
      to_stop_details: { id: 4, name: 'Park Station', code: 'PS1' }
    }
  ],
  routes: [
    { id: 1, name: 'North to South Line', route_number: 'T5', description: 'North to South Line' },
    { id: 2, name: 'East to West Line', route_number: 'T3', description: 'East to West Line' },
    { id: 3, name: 'City Circle', route_number: 'B2', description: 'City Circle' }
  ],
  stops: [
    { id: 1, name: 'Home Station', code: 'HS1' },
    { id: 2, name: 'Office Station', code: 'OS1' },
    { id: 3, name: 'Mall Station', code: 'MS1' },
    { id: 4, name: 'Park Station', code: 'PS1' },
    { id: 5, name: 'Downtown Station', code: 'DS1' }
  ],
  mapSettings: {
    id: 1,
    default_map_type: 'normal',
    auto_locate: true,
    show_traffic: false,
    show_bus_stops: true,
    show_tram_stops: true,
    night_mode: false,
    map_zoom_level: 15
  }
};

// API服务方法
const apiService = {
  // 认证相关
  login: (credentials) => {
    return apiClient.post('/login/', credentials);
  },
  
  logout: () => {
    return apiClient.post('/logout/');
  },
  
  register: (userData) => {
    return apiClient.post('/register/', userData);
  },
  
  requestPasswordReset: (email) => {
    return apiClient.post('/request-password-reset/', { email });
  },
  
  resetPassword: (uidb64, token, password) => {
    return apiClient.post(`/reset-password/${uidb64}/${token}/`, { password });
  },
  
  changePassword: (oldPassword, newPassword) => {
    return apiClient.post('/change-password/', { old_password: oldPassword, new_password: newPassword });
  },
  
  // 检查是否已登录
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        // 设置认证头
        apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
        
        // 解析用户信息
        const userData = JSON.parse(user);
        console.log('当前登录用户信息:', userData);
        
        return {
          isAuthenticated: true,
          user: userData
        };
      } catch (error) {
        console.error('解析用户信息出错:', error);
        // 清除无效的存储数据
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // 删除认证头
    delete apiClient.defaults.headers.common['Authorization'];
    
    return {
      isAuthenticated: false,
      user: null
    };
  },
  
  // 用户相关
  getUserProfile: () => {
    return apiClient.get('/profile/');
  },
  
  updateUserProfile: (profileData) => {
    return apiClient.put('/profile/', profileData);
  },
  
  // 交通类型相关
  getTransportTypes: () => {
    return apiClient.get('/transport-types/');
  },
  
  // 路线相关
  getRoutes: (params = {}) => {
    // 返回模拟数据
    return Promise.resolve({ data: mockData.routes });
  },
  
  getRouteById: (id) => {
    return apiClient.get(`/routes/${id}/`);
  },
  
  // 站点相关
  getStops: (params = {}) => {
    // 返回模拟数据
    return Promise.resolve({ data: mockData.stops });
  },
  
  // 时刻表相关
  getSchedules: (params = {}) => {
    return apiClient.get('/schedules/', { params });
  },
  
  // 系统状态相关
  getSystemStatus: () => {
    return apiClient.get('/system-status/');
  },
  
  // 通知相关
  getNotifications: () => {
    return apiClient.get('/notifications/');
  },
  
  markNotificationAsRead: (id) => {
    return apiClient.patch(`/notifications/${id}/`, { is_read: true });
  },
  
  // 用户路线相关
  getUserRoutes: () => {
    return apiClient.get('/user-routes/');
  },
  
  addUserRoute: (routeData) => {
    return apiClient.post('/user-routes/', routeData);
  },
  
  deleteUserRoute: (id) => {
    return apiClient.delete(`/user-routes/${id}/`);
  },
  
  // 用户设置相关
  getUserSettings: () => {
    console.log('获取用户设置...');
    try {
      return apiClient.get('/user-settings/');
    } catch (error) {
      console.error('获取用户设置失败:', error);
      // 返回一个默认的空设置
      return Promise.resolve({ 
        data: { 
          reminder_enabled: true, 
          notification_enabled: true 
        } 
      });
    }
  },
  
  updateUserSettings: (settingsData) => {
    console.log('更新用户设置:', settingsData);
    try {
      // 如果有ID，使用PUT更新，否则使用POST创建
      if (settingsData.id) {
        return apiClient.put(`/user-settings/${settingsData.id}/`, settingsData);
      } else {
        return apiClient.post('/user-settings/', settingsData);
      }
    } catch (error) {
      console.error('更新用户设置失败:', error);
      return Promise.reject(error);
    }
  },
  
  // 地图设置相关
  getMapSettings: () => {
    console.log('获取地图设置...');
    try {
      // 尝试从API获取地图设置
      return apiClient.get('/map-settings/').catch(error => {
        console.log('API获取地图设置失败，使用模拟数据');
        // 如果API调用失败，使用模拟数据
        return Promise.resolve({ data: mockData.mapSettings });
      });
    } catch (error) {
      console.error('获取地图设置失败:', error);
      // 返回默认的地图设置
      return Promise.resolve({ data: mockData.mapSettings });
    }
  },
  
  updateMapSettings: (settingsData) => {
    console.log('更新地图设置:', settingsData);
    try {
      // 如果有ID，使用PUT更新，否则使用POST创建
      if (settingsData.id) {
        return apiClient.put(`/map-settings/${settingsData.id}/`, settingsData)
          .catch(error => {
            console.log('API更新地图设置失败，使用模拟数据');
            // 如果API调用失败，更新模拟数据
            mockData.mapSettings = { ...mockData.mapSettings, ...settingsData };
            return Promise.resolve({ data: mockData.mapSettings });
          });
      } else {
        return apiClient.post('/map-settings/', settingsData)
          .catch(error => {
            console.log('API创建地图设置失败，使用模拟数据');
            // 如果API调用失败，创建模拟数据
            const newSettings = { 
              ...settingsData, 
              id: 1 
            };
            mockData.mapSettings = newSettings;
            return Promise.resolve({ data: newSettings });
          });
      }
    } catch (error) {
      console.error('更新地图设置失败:', error);
      return Promise.reject(error);
    }
  },
  
  // 路线规划相关
  planTrip: (params) => {
    return apiClient.post('/plan-trip/', params);
  },
  
  getRecentLocations: () => {
    return apiClient.get('/recent-locations/');
  },
  
  getFavoriteLocations: () => {
    return apiClient.get('/favorite-locations/');
  },
  
  addFavoriteLocation: (locationData) => {
    return apiClient.post('/favorite-locations/', locationData);
  },
  
  deleteFavoriteLocation: (id) => {
    return apiClient.delete(`/favorite-locations/${id}/`);
  },
  
  saveTrip: (tripData) => {
    return apiClient.post('/save-trip/', tripData);
  },
  
  getSavedTrips: () => {
    return apiClient.get('/saved-trips/');
  },
  
  getTripHistory: (params = {}) => {
    return apiClient.get('/trip-history/', { params });
  },
  
  // 地点相关
  getLandmarks: (params = {}) => {
    return apiClient.get('/landmarks/', { params });
  },
  
  // 费用相关
  getFareTypes: () => {
    return apiClient.get('/fare-types/');
  },
  
  // 搜索
  search: (query) => {
    return apiClient.get('/search/', { params: { q: query } });
  },
  
  // 提醒相关
  getReminders: (params = {}) => {
    // 返回模拟数据
    return Promise.resolve({ data: mockData.reminders });
  },
  
  getReminderById: (id) => {
    // 返回模拟数据
    const reminder = mockData.reminders.find(r => r.id === id);
    return Promise.resolve({ data: reminder });
  },
  
  createReminder: (reminderData) => {
    // 模拟创建提醒
    const newReminder = {
      ...reminderData,
      id: mockData.reminders.length + 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 添加关联数据
    if (newReminder.route) {
      const route = mockData.routes.find(r => r.id.toString() === newReminder.route.toString());
      if (route) {
        newReminder.route_details = { ...route };
      }
    }
    
    if (newReminder.from_stop) {
      const fromStop = mockData.stops.find(s => s.id.toString() === newReminder.from_stop.toString());
      if (fromStop) {
        newReminder.from_stop_details = { ...fromStop };
      }
    }
    
    if (newReminder.to_stop) {
      const toStop = mockData.stops.find(s => s.id.toString() === newReminder.to_stop.toString());
      if (toStop) {
        newReminder.to_stop_details = { ...toStop };
      }
    }
    
    mockData.reminders.push(newReminder);
    return Promise.resolve({ data: newReminder });
  },
  
  updateReminder: (id, reminderData) => {
    // 模拟更新提醒
    const index = mockData.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      const updatedReminder = {
        ...mockData.reminders[index],
        ...reminderData,
        updated_at: new Date().toISOString()
      };
      
      // 更新关联数据
      if (updatedReminder.route) {
        const route = mockData.routes.find(r => r.id.toString() === updatedReminder.route.toString());
        if (route) {
          updatedReminder.route_details = { ...route };
        }
      }
      
      if (updatedReminder.from_stop) {
        const fromStop = mockData.stops.find(s => s.id.toString() === updatedReminder.from_stop.toString());
        if (fromStop) {
          updatedReminder.from_stop_details = { ...fromStop };
        }
      }
      
      if (updatedReminder.to_stop) {
        const toStop = mockData.stops.find(s => s.id.toString() === updatedReminder.to_stop.toString());
        if (toStop) {
          updatedReminder.to_stop_details = { ...toStop };
        }
      }
      
      mockData.reminders[index] = updatedReminder;
      return Promise.resolve({ data: updatedReminder });
    }
    return Promise.reject(new Error('Reminder not found'));
  },
  
  deleteReminder: (id) => {
    // 模拟删除提醒
    const index = mockData.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      mockData.reminders.splice(index, 1);
      return Promise.resolve({ data: { success: true } });
    }
    return Promise.reject(new Error('Reminder not found'));
  },
  
  cancelReminder: (id) => {
    // 模拟取消提醒
    const index = mockData.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      mockData.reminders[index].status = 'cancelled';
      return Promise.resolve({ data: mockData.reminders[index] });
    }
    return Promise.reject(new Error('Reminder not found'));
  },
  
  completeReminder: (id) => {
    // 模拟完成提醒
    const index = mockData.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      mockData.reminders[index].status = 'completed';
      return Promise.resolve({ data: mockData.reminders[index] });
    }
    return Promise.reject(new Error('Reminder not found'));
  },
  
  getUpcomingReminders: () => {
    // 返回所有活跃的提醒作为即将到来的提醒
    const upcomingReminders = mockData.reminders.filter(r => r.status === 'active');
    return Promise.resolve({ data: upcomingReminders });
  },
  
  getTodayReminders: () => {
    // 返回所有活跃的提醒作为今日提醒
    const todayReminders = mockData.reminders.filter(r => r.status === 'active');
    return Promise.resolve({ data: todayReminders });
  },
};

export default apiService; 