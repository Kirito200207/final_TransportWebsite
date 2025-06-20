import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlanTripPage from './PlanTripPage';
import apiService from '../services/api';

// 模拟API服务
jest.mock('../services/api', () => ({
  getRecentLocations: jest.fn(),
  getFavoriteLocations: jest.fn(),
  planTrip: jest.fn()
}));

describe('PlanTripPage 组件测试', () => {
  // 每个测试前重置模拟
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟API响应
    apiService.getRecentLocations.mockResolvedValue({
      data: [
        { id: 1, name: 'Home', address: '123 Main St' },
        { id: 2, name: 'Office', address: '456 Work Ave' }
      ]
    });
    
    apiService.getFavoriteLocations.mockResolvedValue({
      data: [
        { id: 1, name: 'Home', address: '123 Main St', icon: '🏠' },
        { id: 2, name: 'Office', address: '456 Work Ave', icon: '🏢' }
      ]
    });
  });

  test('渲染行程规划表单', () => {
    render(<PlanTripPage isActive={true} />);
    
    // 检查标题是否存在
    expect(screen.getByText('Plan Your Trip')).toBeInTheDocument();
    
    // 检查出发地输入框是否存在
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    
    // 检查目的地输入框是否存在
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    
    // 检查交换按钮是否存在
    expect(screen.getByLabelText('Swap locations')).toBeInTheDocument();
    
    // 检查出发时间选项是否存在
    expect(screen.getByLabelText('Leave now')).toBeInTheDocument();
    expect(screen.getByLabelText('Schedule')).toBeInTheDocument();
    
    // 检查交通方式选项是否存在
    expect(screen.getByText('Preferred transport')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Tram')).toBeInTheDocument();
    expect(screen.getByText('Bus')).toBeInTheDocument();
    
    // 检查查找路线按钮是否存在
    expect(screen.getByText('Find Routes')).toBeInTheDocument();
  });

  test('加载收藏和最近的地点', async () => {
    render(<PlanTripPage isActive={true} />);
    
    // 验证API调用
    expect(apiService.getRecentLocations).toHaveBeenCalled();
    expect(apiService.getFavoriteLocations).toHaveBeenCalled();
    
    // 等待收藏地点加载
    await waitFor(() => {
      expect(screen.getByText('Favorite Places')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Office')).toBeInTheDocument();
    });
    
    // 等待最近地点加载
    await waitFor(() => {
      expect(screen.getByText('Recent Places')).toBeInTheDocument();
    });
  });

  test('交换出发地和目的地', () => {
    render(<PlanTripPage isActive={true} />);
    
    // 输入出发地和目的地
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: 'Home' }
    });
    
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'Office' }
    });
    
    // 点击交换按钮
    fireEvent.click(screen.getByLabelText('Swap locations'));
    
    // 验证交换结果
    expect(screen.getByLabelText('From').value).toBe('Office');
    expect(screen.getByLabelText('To').value).toBe('Home');
  });

  test('选择出发时间类型', () => {
    render(<PlanTripPage isActive={true} />);
    
    // 默认应该选择"现在出发"
    expect(screen.getByLabelText('Leave now')).toBeChecked();
    expect(screen.getByLabelText('Schedule')).not.toBeChecked();
    
    // 点击"预定时间"
    fireEvent.click(screen.getByLabelText('Schedule'));
    
    // 验证选择结果
    expect(screen.getByLabelText('Leave now')).not.toBeChecked();
    expect(screen.getByLabelText('Schedule')).toBeChecked();
    
    // 检查日期和时间输入框是否显示
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
  });

  test('选择交通方式偏好', () => {
    render(<PlanTripPage isActive={true} />);
    
    // 默认应该选择"全部"
    expect(screen.getByText('All').closest('button')).toHaveClass('active');
    
    // 点击"电车"
    fireEvent.click(screen.getByText('Tram'));
    
    // 验证选择结果
    expect(screen.getByText('All').closest('button')).not.toHaveClass('active');
    expect(screen.getByText('Tram').closest('button')).toHaveClass('active');
  });

  test('提交行程规划表单', async () => {
    // 模拟规划行程API响应
    apiService.planTrip.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: {
              routes: [
                {
                  id: 1,
                  duration: 25,
                  transfers: 0,
                  departure: '14:05',
                  arrival: '14:30',
                  price: '3.50',
                  steps: [
                    { type: 'walk', duration: 5, description: 'Walk to Station A' },
                    { type: 'tram', line: 'T5', duration: 15, stops: 4, description: 'Take Tram T5 to Station B' },
                    { type: 'walk', duration: 5, description: 'Walk to destination' }
                  ]
                }
              ]
            }
          });
        }, 100);
      });
    });
    
    render(<PlanTripPage isActive={true} />);
    
    // 输入出发地和目的地
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: 'Home' }
    });
    
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'Office' }
    });
    
    // 点击查找路线按钮
    fireEvent.click(screen.getByText('Find Routes'));
    
    // 验证加载指示器显示
    expect(screen.getByText('Finding the best routes...')).toBeInTheDocument();
    
    // 等待路线结果显示
    await waitFor(() => {
      expect(screen.getByText('Route Options')).toBeInTheDocument();
      expect(screen.getByText('25 min')).toBeInTheDocument();
      expect(screen.getByText('Direct')).toBeInTheDocument();
      expect(screen.getByText('$3.50')).toBeInTheDocument();
    });
  });

  test('显示表单验证错误', () => {
    render(<PlanTripPage isActive={true} />);
    
    // 不输入出发地和目的地
    
    // 点击查找路线按钮
    fireEvent.click(screen.getByText('Find Routes'));
    
    // 验证错误消息显示
    expect(screen.getByText('Please enter both origin and destination')).toBeInTheDocument();
  });
}); 