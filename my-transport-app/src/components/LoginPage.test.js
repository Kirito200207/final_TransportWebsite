import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import apiService from '../services/api';

// 模拟API服务
jest.mock('../services/api', () => ({
  login: jest.fn()
}));

// 测试包装器组件
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('LoginPage 组件测试', () => {
  // 每个测试前重置模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('渲染登录表单', () => {
    render(<LoginPage />, { wrapper: TestWrapper });
    
    // 检查标题是否存在
    expect(screen.getByText('Login')).toBeInTheDocument();
    
    // 检查用户名输入框是否存在
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    
    // 检查密码输入框是否存在
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    // 检查登录按钮是否存在
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    
    // 检查注册链接是否存在
    expect(screen.getByText('Register')).toBeInTheDocument();
    
    // 检查忘记密码链接是否存在
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
  });

  test('输入表单字段并提交', async () => {
    // 模拟成功登录响应
    apiService.login.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      }
    });
    
    // 模拟回调函数
    const mockOnLogin = jest.fn();
    
    render(
      <LoginPage onLogin={mockOnLogin} />,
      { wrapper: TestWrapper }
    );
    
    // 输入用户名
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    
    // 输入密码
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    // 点击登录按钮
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // 验证API调用
    expect(apiService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
    
    // 等待回调被调用
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });
    });
  });

  test('处理登录错误', async () => {
    // 模拟登录失败
    apiService.login.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Invalid credentials'
        }
      }
    });
    
    render(<LoginPage />, { wrapper: TestWrapper });
    
    // 输入用户名
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    
    // 输入密码
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    // 点击登录按钮
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // 验证API调用
    expect(apiService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'wrongpassword'
    });
    
    // 等待错误消息显示
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('点击忘记密码链接', () => {
    const mockOnForgotPassword = jest.fn();
    
    render(
      <LoginPage onForgotPassword={mockOnForgotPassword} />,
      { wrapper: TestWrapper }
    );
    
    // 点击忘记密码链接
    fireEvent.click(screen.getByText('Forgot Password?'));
    
    // 验证回调被调用
    expect(mockOnForgotPassword).toHaveBeenCalled();
  });

  test('点击注册链接', () => {
    const mockOnRegister = jest.fn();
    
    render(
      <LoginPage onRegister={mockOnRegister} />,
      { wrapper: TestWrapper }
    );
    
    // 点击注册链接
    fireEvent.click(screen.getByText('Register'));
    
    // 验证回调被调用
    expect(mockOnRegister).toHaveBeenCalled();
  });
}); 