from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import TransportType, Route, Stop, RouteStop, Notification, UserSettings
from .serializers import TransportTypeSerializer, RouteSerializer, UserSerializer

# 模型测试
class TransportTypeModelTest(TestCase):
    """测试 TransportType 模型"""
    
    def setUp(self):
        """设置测试数据"""
        TransportType.objects.create(
            name="Tram", 
            icon_url="/img2/有轨电车.png",
            color="#e74c3c",
            description="叶卡捷琳堡的有轨电车系统"
        )
    
    def test_transport_type_creation(self):
        """测试创建交通类型"""
        tram = TransportType.objects.get(name="Tram")
        self.assertEqual(tram.color, "#e74c3c")
        self.assertEqual(tram.description, "叶卡捷琳堡的有轨电车系统")

class RouteModelTest(TestCase):
    """测试 Route 模型"""
    
    def setUp(self):
        """设置测试数据"""
        transport_type = TransportType.objects.create(
            name="Tram", 
            icon_url="/img2/有轨电车.png",
            color="#e74c3c"
        )
        
        Route.objects.create(
            route_number="T5",
            name="东西贯穿线",
            transport_type=transport_type,
            color="#f1c40f",
            is_accessible=True,
            weekday_first_departure="05:45",
            weekday_last_departure="00:15",
            frequency_peak_minutes=7,
            frequency_offpeak_minutes=12,
            description="连接城市东西部的快速电车线路"
        )
    
    def test_route_creation(self):
        """测试创建路线"""
        route = Route.objects.get(route_number="T5")
        self.assertEqual(route.name, "东西贯穿线")
        self.assertEqual(route.frequency_peak_minutes, 7)
        self.assertTrue(route.is_accessible)
        self.assertEqual(route.transport_type.name, "Tram")

# 用户设置模型测试
class UserSettingsModelTest(TestCase):
    """测试 UserSettings 模型"""
    
    def setUp(self):
        """设置测试数据"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        # 使用 get_or_create 避免重复创建
        self.user_settings, created = UserSettings.objects.get_or_create(
            user=self.user,
            defaults={
                'reminder_enabled': True,
                'notification_enabled': False
            }
        )
    
    def test_user_settings_creation(self):
        """测试创建用户设置"""
        settings = UserSettings.objects.get(user=self.user)
        self.assertTrue(settings.reminder_enabled)
        self.assertFalse(settings.notification_enabled)
        self.assertEqual(settings.user.username, 'testuser')

# 序列化器测试
class TransportTypeSerializerTest(TestCase):
    """测试 TransportType 序列化器"""
    
    def setUp(self):
        """设置测试数据"""
        self.transport_type_attributes = {
            'name': 'Bus',
            'icon_url': '/img2/android-bus.png',
            'color': '#3498db',
            'description': '叶卡捷琳堡的公交车网络'
        }
        
        self.transport_type = TransportType.objects.create(**self.transport_type_attributes)
        self.serializer = TransportTypeSerializer(instance=self.transport_type)
    
    def test_contains_expected_fields(self):
        """测试序列化器包含预期字段"""
        data = self.serializer.data
        self.assertEqual(set(data.keys()), set(['id', 'name', 'icon_url', 'color', 'description']))
    
    def test_name_field_content(self):
        """测试name字段内容"""
        data = self.serializer.data
        self.assertEqual(data['name'], self.transport_type_attributes['name'])
    
    def test_color_field_content(self):
        """测试color字段内容"""
        data = self.serializer.data
        self.assertEqual(data['color'], self.transport_type_attributes['color'])

# API视图测试
class TransportTypeAPITest(APITestCase):
    """测试 TransportType API"""
    
    def setUp(self):
        """设置测试数据"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        self.admin_user = User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password='adminpassword123',
            is_staff=True
        )
        
        self.transport_type = TransportType.objects.create(
            name="Metro",
            icon_url="/img2/地铁.png",
            color="#9b59b6",
            description="叶卡捷琳堡地铁"
        )
        
        self.transport_type_url = reverse('transporttype-list')
    
    def test_get_all_transport_types(self):
        """测试获取所有交通类型"""
        response = self.client.get(self.transport_type_url)
        transport_types = TransportType.objects.all()
        serializer = TransportTypeSerializer(transport_types, many=True)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)
    
    def test_create_transport_type_unauthenticated(self):
        """测试未认证用户创建交通类型"""
        new_transport_type = {
            'name': 'Trolleybus',
            'icon_url': '/img2/无轨电车.png',
            'color': '#2ecc71',
            'description': '无轨电车系统'
        }
        
        response = self.client.post(self.transport_type_url, new_transport_type, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_transport_type_authenticated(self):
        """测试认证用户创建交通类型"""
        self.client.force_authenticate(user=self.admin_user)
        
        new_transport_type = {
            'name': 'Trolleybus',
            'icon_url': '/img2/无轨电车.png',
            'color': '#2ecc71',
            'description': '无轨电车系统'
        }
        
        response = self.client.post(self.transport_type_url, new_transport_type, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TransportType.objects.count(), 2)
        self.assertEqual(TransportType.objects.get(name='Trolleybus').description, '无轨电车系统')

# 用户认证测试
class UserAuthenticationTest(APITestCase):
    """测试用户认证"""
    
    def setUp(self):
        """设置测试数据"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        self.login_url = reverse('login')
    
    def test_user_login(self):
        """测试用户登录"""
        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('token' in response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
    
    def test_user_login_invalid_credentials(self):
        """测试无效凭据登录"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
