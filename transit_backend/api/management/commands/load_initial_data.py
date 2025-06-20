from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    TransportType, Route, Stop, RouteStop, Schedule,
    SystemStatus, Notification, UserSettings
)
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = '加载初始测试数据'

    def handle(self, *args, **kwargs):
        self.stdout.write('开始加载初始数据...')
        
        # 清除现有数据（谨慎使用）
        self._clear_data()
        
        # 创建测试用户
        self._create_users()
        
        # 创建交通类型
        transport_types = self._create_transport_types()
        
        # 创建站点
        stops = self._create_stops()
        
        # 创建路线
        routes = self._create_routes(transport_types)
        
        # 创建路线站点关系
        self._create_route_stops(routes, stops)
        
        # 创建时刻表
        self._create_schedules(routes, stops)
        
        # 创建系统状态
        self._create_system_status(transport_types)
        
        # 创建通知
        self._create_notifications(transport_types, routes)
        
        self.stdout.write(self.style.SUCCESS('初始数据加载完成!'))
    
    def _clear_data(self):
        """清除现有数据"""
        self.stdout.write('清除现有数据...')
        Notification.objects.all().delete()
        SystemStatus.objects.all().delete()
        Schedule.objects.all().delete()
        RouteStop.objects.all().delete()
        Route.objects.all().delete()
        Stop.objects.all().delete()
        TransportType.objects.all().delete()
        # 不删除用户和用户设置
    
    def _create_users(self):
        """创建测试用户"""
        self.stdout.write('创建测试用户...')
        
        # 创建测试用户
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        
        # 创建用户设置
        UserSettings.objects.create(
            user=user,
            reminder_enabled=True,
            notification_enabled=True
        )
        
        return user
    
    def _create_transport_types(self):
        """创建交通类型"""
        self.stdout.write('创建交通类型...')
        
        tram = TransportType.objects.create(
            name='Tram',
            icon='/img2/有轨电车.png'
        )
        
        bus = TransportType.objects.create(
            name='Bus',
            icon='/img2/android-bus.png'
        )
        
        return {'tram': tram, 'bus': bus}
    
    def _create_stops(self):
        """创建站点"""
        self.stdout.write('创建站点...')
        
        stops = {
            'central_station': Stop.objects.create(
                name='Central Station',
                latitude=56.8389,
                longitude=60.6057
            ),
            'north_square': Stop.objects.create(
                name='North Square',
                latitude=56.8459,
                longitude=60.6157
            ),
            'west_mall': Stop.objects.create(
                name='West Mall',
                latitude=56.8329,
                longitude=60.5957
            ),
            'east_station': Stop.objects.create(
                name='East Station',
                latitude=56.8329,
                longitude=60.6157
            ),
            'south_terminal': Stop.objects.create(
                name='South Terminal',
                latitude=56.8259,
                longitude=60.6057
            ),
            'city_center': Stop.objects.create(
                name='City Center',
                latitude=56.8389,
                longitude=60.6107
            ),
            'university': Stop.objects.create(
                name='University',
                latitude=56.8429,
                longitude=60.6037
            ),
            'shopping_mall': Stop.objects.create(
                name='Shopping Mall',
                latitude=56.8349,
                longitude=60.6207
            )
        }
        
        return stops
    
    def _create_routes(self, transport_types):
        """创建路线"""
        self.stdout.write('创建路线...')
        
        routes = {
            't5': Route.objects.create(
                route_number='T5',
                name='West Mall - Central Station - East Station',
                transport_type=transport_types['tram'],
                is_active=True,
                frequency='Every 8 min',
                operating_cars='4/5'
            ),
            't3': Route.objects.create(
                route_number='T3',
                name='North Square - City Center - South Terminal',
                transport_type=transport_types['tram'],
                is_active=True,
                frequency='Every 10 min',
                operating_cars='3/4'
            ),
            'b123': Route.objects.create(
                route_number='123',
                name='Central Station - University - Shopping Mall',
                transport_type=transport_types['bus'],
                is_active=True,
                frequency='Every 15 min',
                operating_cars='5/6'
            ),
            'b456': Route.objects.create(
                route_number='456',
                name='South Terminal - East Station - North Square',
                transport_type=transport_types['bus'],
                is_active=True,
                frequency='Every 20 min',
                operating_cars='4/4'
            )
        }
        
        return routes
    
    def _create_route_stops(self, routes, stops):
        """创建路线站点关系"""
        self.stdout.write('创建路线站点关系...')
        
        # T5路线站点
        RouteStop.objects.create(route=routes['t5'], stop=stops['west_mall'], order=1)
        RouteStop.objects.create(route=routes['t5'], stop=stops['central_station'], order=2)
        RouteStop.objects.create(route=routes['t5'], stop=stops['east_station'], order=3)
        
        # T3路线站点
        RouteStop.objects.create(route=routes['t3'], stop=stops['north_square'], order=1)
        RouteStop.objects.create(route=routes['t3'], stop=stops['city_center'], order=2)
        RouteStop.objects.create(route=routes['t3'], stop=stops['south_terminal'], order=3)
        
        # 123路线站点
        RouteStop.objects.create(route=routes['b123'], stop=stops['central_station'], order=1)
        RouteStop.objects.create(route=routes['b123'], stop=stops['university'], order=2)
        RouteStop.objects.create(route=routes['b123'], stop=stops['shopping_mall'], order=3)
        
        # 456路线站点
        RouteStop.objects.create(route=routes['b456'], stop=stops['south_terminal'], order=1)
        RouteStop.objects.create(route=routes['b456'], stop=stops['east_station'], order=2)
        RouteStop.objects.create(route=routes['b456'], stop=stops['north_square'], order=3)
    
    def _create_schedules(self, routes, stops):
        """创建时刻表"""
        self.stdout.write('创建时刻表...')
        
        # 创建工作日时刻表（周一到周五）
        for day in range(5):  # 0-4表示周一到周五
            # T5路线时刻表
            for hour in range(6, 23):  # 6:00 - 22:00
                for minute in [0, 8, 16, 24, 32, 40, 48, 56]:  # 每8分钟一班
                    arrival_time = datetime.time(hour, minute)
                    
                    # 为每个站点创建时刻表，考虑站点顺序
                    Schedule.objects.create(
                        route=routes['t5'],
                        stop=stops['west_mall'],
                        arrival_time=arrival_time,
                        day_of_week=day
                    )
                    
                    # 下一站点时间加3分钟
                    next_minute = (minute + 3) % 60
                    next_hour = hour + (minute + 3) // 60
                    if next_hour < 24:
                        Schedule.objects.create(
                            route=routes['t5'],
                            stop=stops['central_station'],
                            arrival_time=datetime.time(next_hour, next_minute),
                            day_of_week=day
                        )
                    
                    # 再下一站点时间再加3分钟
                    next_minute = (minute + 6) % 60
                    next_hour = hour + (minute + 6) // 60
                    if next_hour < 24:
                        Schedule.objects.create(
                            route=routes['t5'],
                            stop=stops['east_station'],
                            arrival_time=datetime.time(next_hour, next_minute),
                            day_of_week=day
                        )
            
            # T3路线时刻表 (简化，仅创建部分时间)
            for hour in range(6, 23, 2):  # 每隔2小时创建一次，减少数据量
                for minute in [0, 10, 20, 30, 40, 50]:  # 每10分钟一班
                    Schedule.objects.create(
                        route=routes['t3'],
                        stop=stops['north_square'],
                        arrival_time=datetime.time(hour, minute),
                        day_of_week=day
                    )
        
        # 创建周末时刻表（简化，仅创建部分）
        for day in range(5, 7):  # 5-6表示周六和周日
            # 周末班次减少
            for hour in range(8, 22, 2):  # 8:00 - 22:00，每隔2小时
                for minute in [0, 15, 30, 45]:  # 每15分钟一班
                    Schedule.objects.create(
                        route=routes['t5'],
                        stop=stops['west_mall'],
                        arrival_time=datetime.time(hour, minute),
                        day_of_week=day
                    )
    
    def _create_system_status(self, transport_types):
        """创建系统状态"""
        self.stdout.write('创建系统状态...')
        
        SystemStatus.objects.create(
            transport_type=transport_types['tram'],
            status='good',
            details='All tram lines operating normally. Average wait time: 4.5 min.'
        )
        
        SystemStatus.objects.create(
            transport_type=transport_types['bus'],
            status='warning',
            details='Minor delays on routes 123 and 456 due to road works.'
        )
    
    def _create_notifications(self, transport_types, routes):
        """创建通知"""
        self.stdout.write('创建通知...')
        
        # 获取测试用户
        user = User.objects.get(username='testuser')
        
        Notification.objects.create(
            title='Tram Service Update',
            message='Line T5: Schedule change on weekends starting next week',
            transport_type=transport_types['tram'],
            route=routes['t5'],
            user=user,
            is_read=False
        )
        
        Notification.objects.create(
            title='Bus Service Alert',
            message='Route 123: Arriving in 5 minutes at Central Station',
            transport_type=transport_types['bus'],
            route=routes['b123'],
            user=user,
            is_read=False
        )
        
        Notification.objects.create(
            title='System Notification',
            message='App updated to version 2.1.0 with new features',
            user=user,
            is_read=True
        ) 