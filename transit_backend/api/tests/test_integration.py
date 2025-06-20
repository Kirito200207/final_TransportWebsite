from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework import status
import json
from ..models import TransportType, Route, Stop, RouteStop, UserSettings, Notification

class UserJourneyIntegrationTest(TestCase):
    """测试用户完整旅程的集成测试"""

    def setUp(self):
        """设置测试数据"""
        self.client = Client()
        
        # 创建测试用户
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        
        # 创建用户设置 - 使用 get_or_create 避免重复创建
        UserSettings.objects.get_or_create(
            user=self.user,
            defaults={
                'reminder_enabled': True,
                'notification_enabled': True
            }
        )
        
        # 创建交通类型
        self.transport_type = TransportType.objects.create(
            name="Tram",
            icon_url="/img2/有轨电车.png",
            color="#e74c3c",
            description="叶卡捷琳堡的有轨电车系统"
        )
        
        # 创建路线
        self.route = Route.objects.create(
            route_number="T5",
            name="东西贯穿线",
            transport_type=self.transport_type,
            color="#f1c40f",
            is_accessible=True,
            description="连接城市东西部的快速电车线路"
        )
        
        # 创建站点
        self.stop1 = Stop.objects.create(
            name="西站",
            code="WS1",
            latitude=56.836389,
            longitude=60.614167
        )
        
        self.stop2 = Stop.objects.create(
            name="中央站",
            code="CS1",
            latitude=56.837778,
            longitude=60.599444
        )
        
        self.stop3 = Stop.objects.create(
            name="东站",
            code="ES1",
            latitude=56.844722,
            longitude=60.654444
        )
        
        # 创建路线站点关系
        RouteStop.objects.create(route=self.route, stop=self.stop1, order=1)
        RouteStop.objects.create(route=self.route, stop=self.stop2, order=2)
        RouteStop.objects.create(route=self.route, stop=self.stop3, order=3)
        
        # URL
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        self.routes_url = reverse('route-list')
        self.stops_url = reverse('stop-list')
        self.plan_trip_url = reverse('plan-trip')
        
    def test_complete_user_journey(self):
        """测试完整的用户旅程"""
        
        # 步骤1：用户登录
        login_data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        
        login_response = self.client.post(
            self.login_url,
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertTrue('token' in login_response.json())
        token = login_response.json()['token']
        
        # 设置认证头
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Token {token}'
        
        # 步骤2：获取用户个人资料
        profile_response = self.client.get(self.profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.json()['username'], 'testuser')
        self.assertEqual(profile_response.json()['email'], 'test@example.com')
        
        # 步骤3：获取所有路线
        routes_response = self.client.get(self.routes_url)
        self.assertEqual(routes_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(routes_response.json()), 1)
        self.assertEqual(routes_response.json()[0]['route_number'], 'T5')
        
        # 步骤4：获取所有站点
        stops_response = self.client.get(self.stops_url)
        self.assertEqual(stops_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(stops_response.json()), 3)
        
        # 步骤5：规划行程
        trip_data = {
            'from': self.stop1.id,
            'to': self.stop3.id,
            'time': 'now',
            'transport': 'all'
        }
        
        trip_response = self.client.post(
            self.plan_trip_url,
            data=json.dumps(trip_data),
            content_type='application/json'
        )
        
        self.assertEqual(trip_response.status_code, status.HTTP_200_OK)
        # 检查返回的路线选项
        self.assertTrue('routes' in trip_response.json())
        self.assertGreaterEqual(len(trip_response.json()['routes']), 1)
        
        # 步骤6：保存行程
        save_trip_url = reverse('save-trip')
        save_trip_data = {
            'from_stop': self.stop1.id,
            'to_stop': self.stop3.id,
            'route': self.route.id,
            'name': '上班路线'
        }
        
        save_response = self.client.post(
            save_trip_url,
            data=json.dumps(save_trip_data),
            content_type='application/json'
        )
        
        self.assertEqual(save_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(save_response.json()['name'], '上班路线')
        
        # 步骤7：获取通知
        notifications_url = reverse('notification-list')
        notifications_response = self.client.get(notifications_url)
        
        self.assertEqual(notifications_response.status_code, status.HTTP_200_OK)
        
        # 步骤8：登出
        logout_url = reverse('logout')
        logout_response = self.client.post(logout_url)
        
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        
        # 验证登出后无法访问受保护资源
        profile_after_logout = self.client.get(self.profile_url)
        self.assertEqual(profile_after_logout.status_code, status.HTTP_401_UNAUTHORIZED)

class AdminIntegrationTest(TestCase):
    """测试管理员功能的集成测试"""
    
    def setUp(self):
        """设置测试数据"""
        self.client = Client()
        
        # 创建管理员用户
        self.admin_user = User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password='adminpassword123',
            is_staff=True
        )
        
        # 创建普通用户
        self.normal_user = User.objects.create_user(
            username='normaluser',
            email='normal@example.com',
            password='normalpassword123'
        )
        
        # URL
        self.login_url = reverse('login')
        self.admin_dashboard_url = reverse('admin-dashboard')
        
    def test_admin_access(self):
        """测试管理员访问权限"""
        
        # 管理员登录
        admin_login_data = {
            'username': 'adminuser',
            'password': 'adminpassword123'
        }
        
        admin_login_response = self.client.post(
            self.login_url,
            data=json.dumps(admin_login_data),
            content_type='application/json'
        )
        
        self.assertEqual(admin_login_response.status_code, status.HTTP_200_OK)
        admin_token = admin_login_response.json()['token']
        
        # 设置管理员认证头
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Token {admin_token}'
        
        # 管理员访问仪表盘
        admin_dashboard_response = self.client.get(self.admin_dashboard_url)
        self.assertEqual(admin_dashboard_response.status_code, status.HTTP_200_OK)
        
        # 管理员登出
        self.client.defaults['HTTP_AUTHORIZATION'] = ''
        
        # 普通用户登录
        normal_login_data = {
            'username': 'normaluser',
            'password': 'normalpassword123'
        }
        
        normal_login_response = self.client.post(
            self.login_url,
            data=json.dumps(normal_login_data),
            content_type='application/json'
        )
        
        self.assertEqual(normal_login_response.status_code, status.HTTP_200_OK)
        normal_token = normal_login_response.json()['token']
        
        # 设置普通用户认证头
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Token {normal_token}'
        
        # 普通用户尝试访问仪表盘
        normal_dashboard_response = self.client.get(self.admin_dashboard_url)
        self.assertEqual(normal_dashboard_response.status_code, status.HTTP_403_FORBIDDEN) 