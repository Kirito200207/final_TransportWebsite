from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    TransportType, Route, Stop, RouteStop, Schedule,
    SystemStatus, Notification, UserRoute, UserSettings, Reminder,
    RouteStatus, VehiclePosition, ExternalAPIKey
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class TransportTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportType
        fields = '__all__'

class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = '__all__'

class RouteStopSerializer(serializers.ModelSerializer):
    stop_details = StopSerializer(source='stop', read_only=True)
    
    class Meta:
        model = RouteStop
        fields = ['id', 'route', 'stop', 'stop_details', 'order']

class RouteSerializer(serializers.ModelSerializer):
    transport_type_details = TransportTypeSerializer(source='transport_type', read_only=True)
    stops = serializers.SerializerMethodField()
    
    class Meta:
        model = Route
        fields = ['id', 'route_number', 'name', 'transport_type', 
                 'transport_type_details', 'is_active', 'frequency', 
                 'operating_cars', 'stops']
    
    def get_stops(self, obj):
        route_stops = RouteStop.objects.filter(route=obj).order_by('order')
        return RouteStopSerializer(route_stops, many=True).data

class ScheduleSerializer(serializers.ModelSerializer):
    route_details = serializers.SerializerMethodField()
    stop_details = StopSerializer(source='stop', read_only=True)
    
    class Meta:
        model = Schedule
        fields = ['id', 'route', 'route_details', 'stop', 'stop_details', 
                 'arrival_time', 'day_of_week']
    
    def get_route_details(self, obj):
        return {
            'id': obj.route.id,
            'route_number': obj.route.route_number,
            'name': obj.route.name
        }

class SystemStatusSerializer(serializers.ModelSerializer):
    transport_type_details = TransportTypeSerializer(source='transport_type', read_only=True)
    
    class Meta:
        model = SystemStatus
        fields = ['id', 'transport_type', 'transport_type_details', 'status', 
                 'details', 'last_updated']

class NotificationSerializer(serializers.ModelSerializer):
    transport_type_details = TransportTypeSerializer(source='transport_type', read_only=True)
    route_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'transport_type', 
                 'transport_type_details', 'route', 'route_details', 
                 'created_at', 'is_read', 'user']
    
    def get_route_details(self, obj):
        if obj.route:
            return {
                'id': obj.route.id,
                'route_number': obj.route.route_number,
                'name': obj.route.name
            }
        return None

class UserRouteSerializer(serializers.ModelSerializer):
    route_details = RouteSerializer(source='route', read_only=True)
    from_stop_details = StopSerializer(source='from_stop', read_only=True)
    to_stop_details = StopSerializer(source='to_stop', read_only=True)
    
    class Meta:
        model = UserRoute
        fields = ['id', 'user', 'route', 'route_details', 'from_stop', 
                 'from_stop_details', 'to_stop', 'to_stop_details', 
                 'name', 'is_favorite']

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['id', 'user', 'reminder_enabled', 'notification_enabled']

class ReminderSerializer(serializers.ModelSerializer):
    route_details = serializers.SerializerMethodField()
    from_stop_details = serializers.SerializerMethodField()
    to_stop_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Reminder
        fields = ['id', 'user', 'title', 'description', 'route', 'route_details', 
                 'from_stop', 'from_stop_details', 'to_stop', 'to_stop_details', 
                 'reminder_time', 'advance_notice', 'repeat_type', 'repeat_days', 
                 'status', 'created_at', 'updated_at']
    
    def get_route_details(self, obj):
        if obj.route:
            return {
                'id': obj.route.id,
                'route_number': obj.route.route_number,
                'name': obj.route.name
            }
        return None
    
    def get_from_stop_details(self, obj):
        if obj.from_stop:
            return {
                'id': obj.from_stop.id,
                'name': obj.from_stop.name,
                'latitude': obj.from_stop.latitude,
                'longitude': obj.from_stop.longitude
            }
        return None
    
    def get_to_stop_details(self, obj):
        if obj.to_stop:
            return {
                'id': obj.to_stop.id,
                'name': obj.to_stop.name,
                'latitude': obj.to_stop.latitude,
                'longitude': obj.to_stop.longitude
            }
        return None

class UserProfileSerializer(serializers.ModelSerializer):
    settings = UserSettingsSerializer(read_only=True)
    routes = UserRouteSerializer(source='routes.all', many=True, read_only=True)
    notifications = serializers.SerializerMethodField()
    reminders = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'settings', 'routes', 'notifications', 'reminders']
    
    def get_notifications(self, obj):
        notifications = Notification.objects.filter(user=obj, is_read=False)
        return NotificationSerializer(notifications, many=True).data
        
    def get_reminders(self, obj):
        reminders = Reminder.objects.filter(user=obj, status='active')
        return ReminderSerializer(reminders, many=True).data

class RouteStatusSerializer(serializers.ModelSerializer):
    """路线状态序列化器"""
    route_details = RouteSerializer(source='route', read_only=True)
    
    class Meta:
        model = RouteStatus
        fields = '__all__'

class VehiclePositionSerializer(serializers.ModelSerializer):
    """车辆位置序列化器"""
    route_details = RouteSerializer(source='route', read_only=True)
    next_stop_details = StopSerializer(source='next_stop', read_only=True)
    
    class Meta:
        model = VehiclePosition
        fields = '__all__'

class ExternalAPIKeySerializer(serializers.ModelSerializer):
    """外部API密钥序列化器"""
    class Meta:
        model = ExternalAPIKey
        fields = ['id', 'name', 'is_active', 'created_at', 'expires_at', 'rate_limit']
        read_only_fields = ['created_at']

class ExternalAPIKeyFullSerializer(serializers.ModelSerializer):
    """包含完整信息的外部API密钥序列化器（仅用于创建和管理）"""
    class Meta:
        model = ExternalAPIKey
        fields = '__all__' 