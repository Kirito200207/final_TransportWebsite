import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';

const PrivateRoute = ({ children }) => {
    const location = useLocation();
    const auth = apiService.checkAuth();

    useEffect(() => {
        console.log('PrivateRoute 检查认证状态:', auth);
        if (!auth.isAuthenticated) {
            console.log('用户未登录，将重定向到登录页面');
        } else {
            console.log('用户已登录，允许访问受保护路由');
        }
    }, [auth.isAuthenticated]);

    if (!auth.isAuthenticated) {
        // 如果用户未登录，重定向到登录页面，并记住用户想要访问的页面
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute; 