from django.test import TestCase
from django.contrib.auth.models import User
from .models import TransportType, Route, UserSettings

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