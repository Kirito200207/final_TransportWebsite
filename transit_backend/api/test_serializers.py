from django.test import TestCase
from .models import TransportType
from .serializers import TransportTypeSerializer

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