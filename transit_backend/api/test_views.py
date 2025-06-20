from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import TransportType
from .serializers import TransportTypeSerializer

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