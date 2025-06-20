from django.shortcuts import render
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import (
    TransportType, Route, Stop, RouteStop, Schedule,
    SystemStatus, Notification, UserRoute, UserSettings, Reminder
)
from .serializers import (
    UserSerializer, TransportTypeSerializer, RouteSerializer,
    StopSerializer, RouteStopSerializer, ScheduleSerializer,
    SystemStatusSerializer, NotificationSerializer, UserRouteSerializer,
    UserSettingsSerializer, UserProfileSerializer, ReminderSerializer
)
from django.utils import timezone
import datetime
from django.http import JsonResponse
from django.contrib.auth import logout, authenticate, login
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
# 导入日志工具
from .utils.logger import log_info, log_debug, log_warning, log_error, log_api_request, log_function_call
# 导入缓存工具
from .utils.cache_utils import cached, invalidate_cache, get_cache_key, cache_data, get_cached_data, delete_cache

class TransportTypeViewSet(viewsets.ModelViewSet):
    """交通类型API视图集"""
    queryset = TransportType.objects.all()
    serializer_class = TransportTypeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @log_api_request
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @log_api_request
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @log_api_request
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @log_api_request
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @log_api_request
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

class RouteViewSet(viewsets.ModelViewSet):
    """路线API视图集"""
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @cached(timeout=60*30)  # 缓存30分钟
    def get_queryset(self):
        queryset = Route.objects.all()
        transport_type = self.request.query_params.get('transport_type')
        is_active = self.request.query_params.get('is_active')
        
        if transport_type:
            queryset = queryset.filter(transport_type=transport_type)
        if is_active:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
            
        return queryset
    
    @invalidate_cache(prefix='RouteViewSet')
    def create(self, request, *args, **kwargs):
        """创建路线，并使缓存失效"""
        return super().create(request, *args, **kwargs)
    
    @invalidate_cache(prefix='RouteViewSet')
    def update(self, request, *args, **kwargs):
        """更新路线，并使缓存失效"""
        return super().update(request, *args, **kwargs)
    
    @invalidate_cache(prefix='RouteViewSet')
    def destroy(self, request, *args, **kwargs):
        """删除路线，并使缓存失效"""
        return super().destroy(request, *args, **kwargs)

class StopViewSet(viewsets.ModelViewSet):
    """站点API视图集"""
    queryset = Stop.objects.all()
    serializer_class = StopSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @cached(timeout=60*60)  # 缓存1小时
    def get_queryset(self):
        return Stop.objects.all()
    
    @invalidate_cache(prefix='StopViewSet')
    def create(self, request, *args, **kwargs):
        """创建站点，并使缓存失效"""
        return super().create(request, *args, **kwargs)
    
    @invalidate_cache(prefix='StopViewSet')
    def update(self, request, *args, **kwargs):
        """更新站点，并使缓存失效"""
        return super().update(request, *args, **kwargs)
    
    @invalidate_cache(prefix='StopViewSet')
    def destroy(self, request, *args, **kwargs):
        """删除站点，并使缓存失效"""
        return super().destroy(request, *args, **kwargs)
    
    @cached(timeout=60*5)  # 缓存5分钟
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """获取附近站点"""
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 1.0)  # 默认1公里
        
        if not lat or not lng:
            return Response(
                {"error": "需要提供经纬度参数"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # 简单的距离计算，实际应用中可能需要更复杂的地理空间查询
        try:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)
            
            # 这里使用简单的欧几里得距离作为示例
            # 实际应用中应该使用地理空间查询或Haversine公式
            stops = Stop.objects.all()
            nearby_stops = []
            
            for stop in stops:
                # 简单距离计算
                distance = ((stop.latitude - lat) ** 2 + (stop.longitude - lng) ** 2) ** 0.5
                # 转换为大致公里数（这只是一个非常粗略的近似值）
                distance_km = distance * 111  # 每经纬度约111公里
                
                if distance_km <= radius:
                    nearby_stops.append({
                        'stop': StopSerializer(stop).data,
                        'distance': round(distance_km, 2)
                    })
            
            # 按距离排序
            nearby_stops.sort(key=lambda x: x['distance'])
            
            return Response(nearby_stops)
        except ValueError:
            return Response(
                {"error": "无效的参数值"},
                status=status.HTTP_400_BAD_REQUEST
            )

class ScheduleViewSet(viewsets.ModelViewSet):
    """时刻表API视图集"""
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @cached(timeout=60*15)  # 缓存15分钟
    def get_queryset(self):
        queryset = Schedule.objects.all()
        route = self.request.query_params.get('route')
        stop = self.request.query_params.get('stop')
        day_of_week = self.request.query_params.get('day_of_week')
        
        if route:
            queryset = queryset.filter(route_stop__route=route)
        if stop:
            queryset = queryset.filter(route_stop__stop=stop)
        if day_of_week:
            queryset = queryset.filter(day_of_week=day_of_week)
            
        return queryset
    
    @invalidate_cache(prefix='ScheduleViewSet')
    def create(self, request, *args, **kwargs):
        """创建时刻表，并使缓存失效"""
        return super().create(request, *args, **kwargs)
    
    @invalidate_cache(prefix='ScheduleViewSet')
    def update(self, request, *args, **kwargs):
        """更新时刻表，并使缓存失效"""
        return super().update(request, *args, **kwargs)
    
    @invalidate_cache(prefix='ScheduleViewSet')
    def destroy(self, request, *args, **kwargs):
        """删除时刻表，并使缓存失效"""
        return super().destroy(request, *args, **kwargs)
    
    @cached(timeout=60*5)  # 缓存5分钟
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """获取即将到达的车辆"""
        stop_id = request.query_params.get('stop')
        route_id = request.query_params.get('route')
        limit = int(request.query_params.get('limit', 5))
        
        if not stop_id:
            return Response(
                {"error": "需要提供站点ID"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # 获取当前时间和星期几
        now = timezone.localtime()
        current_time = now.time()
        day_of_week = now.weekday()  # 0-6, 0是星期一
        
        # 查询条件
        query = {
            'route_stop__stop': stop_id,
            'day_of_week': day_of_week
        }
        
        if route_id:
            query['route_stop__route'] = route_id
            
        # 获取今天剩余的班次
        today_schedules = Schedule.objects.filter(
            **query,
            departure_time__gt=current_time
        ).order_by('departure_time')[:limit]
        
        # 如果今天的班次不足，获取明天的班次
        if today_schedules.count() < limit:
            remaining = limit - today_schedules.count()
            next_day = (day_of_week + 1) % 7
            
            query['day_of_week'] = next_day
            tomorrow_schedules = Schedule.objects.filter(
                **query
            ).order_by('departure_time')[:remaining]
            
            # 合并结果
            serialized_today = ScheduleSerializer(today_schedules, many=True).data
            serialized_tomorrow = ScheduleSerializer(tomorrow_schedules, many=True).data
            
            for schedule in serialized_tomorrow:
                schedule['is_next_day'] = True
                
            return Response(list(serialized_today) + list(serialized_tomorrow))
        
        return Response(ScheduleSerializer(today_schedules, many=True).data)

class SystemStatusViewSet(viewsets.ModelViewSet):
    """系统状态API视图集"""
    queryset = SystemStatus.objects.all()
    serializer_class = SystemStatusSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @cached(timeout=60*5)  # 缓存5分钟
    def get_queryset(self):
        return SystemStatus.objects.all().order_by('-created_at')
    
    @cached(timeout=60*1)  # 缓存1分钟
    @action(detail=False, methods=['get'])
    def current(self, request):
        """获取当前系统状态"""
        try:
            latest_status = SystemStatus.objects.latest('created_at')
            return Response(SystemStatusSerializer(latest_status).data)
        except SystemStatus.DoesNotExist:
            return Response(
                {"error": "没有系统状态记录"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @invalidate_cache(prefix='SystemStatusViewSet')
    def create(self, request, *args, **kwargs):
        """创建系统状态，并使缓存失效"""
        return super().create(request, *args, **kwargs)
    
    @invalidate_cache(prefix='SystemStatusViewSet')
    def update(self, request, *args, **kwargs):
        """更新系统状态，并使缓存失效"""
        return super().update(request, *args, **kwargs)

class NotificationViewSet(viewsets.ModelViewSet):
    """通知API视图集"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """标记通知为已读"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "success"})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """标记所有通知为已读"""
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "success"})

class UserRouteViewSet(viewsets.ModelViewSet):
    """用户路线API视图集"""
    serializer_class = UserRouteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserRoute.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """切换收藏状态"""
        user_route = self.get_object()
        user_route.is_favorite = not user_route.is_favorite
        user_route.save()
        serializer = self.get_serializer(user_route)
        return Response(serializer.data)

class UserSettingsViewSet(viewsets.ModelViewSet):
    """用户设置API视图集"""
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        print(f"获取用户 {self.request.user.username} 的设置")
        return UserSettings.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # 确保一个用户只有一个设置记录
        print(f"为用户 {self.request.user.username} 创建设置")
        serializer.save(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        print(f"更新用户 {request.user.username} 的设置: {request.data}")
        # 获取用户的设置记录，如果不存在则创建
        try:
            instance = UserSettings.objects.get(user=request.user)
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            print(f"用户 {request.user.username} 的设置已更新: {serializer.data}")
            return Response(serializer.data)
        except UserSettings.DoesNotExist:
            # 创建新的设置记录
            data = request.data.copy()
            data['user'] = request.user.id
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            print(f"为用户 {request.user.username} 创建了新的设置: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        # 获取用户的设置，如果不存在则创建
        try:
            settings = UserSettings.objects.get(user=request.user)
            serializer = self.get_serializer(settings)
            print(f"返回用户 {request.user.username} 的设置: {serializer.data}")
            return Response(serializer.data)
        except UserSettings.DoesNotExist:
            # 创建默认设置
            settings = UserSettings.objects.create(user=request.user)
            serializer = self.get_serializer(settings)
            print(f"为用户 {request.user.username} 创建了默认设置: {serializer.data}")
            return Response(serializer.data)

class ReminderViewSet(viewsets.ModelViewSet):
    """提醒API视图集"""
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """获取当前用户的提醒"""
        queryset = Reminder.objects.filter(user=self.request.user)
        status_param = self.request.query_params.get('status')
        
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset.order_by('reminder_time')
    
    def perform_create(self, serializer):
        """创建提醒时自动设置用户"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """取消提醒"""
        reminder = self.get_object()
        reminder.status = 'cancelled'
        reminder.save()
        return Response({"status": "提醒已取消"})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """标记提醒为已完成"""
        reminder = self.get_object()
        reminder.status = 'completed'
        reminder.save()
        return Response({"status": "提醒已标记为完成"})
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """获取即将到来的提醒"""
        now = timezone.now()
        # 获取未来24小时内的提醒
        end_time = now + datetime.timedelta(hours=24)
        
        reminders = Reminder.objects.filter(
            user=request.user,
            status='active',
            reminder_time__gte=now,
            reminder_time__lte=end_time
        ).order_by('reminder_time')
        
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """获取今天的提醒"""
        today = timezone.now().date()
        tomorrow = today + datetime.timedelta(days=1)
        
        today_start = datetime.datetime.combine(today, datetime.time.min, tzinfo=timezone.get_current_timezone())
        today_end = datetime.datetime.combine(tomorrow, datetime.time.min, tzinfo=timezone.get_current_timezone())
        
        reminders = Reminder.objects.filter(
            user=request.user,
            reminder_time__gte=today_start,
            reminder_time__lt=today_end
        ).order_by('reminder_time')
        
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)

class UserProfileView(generics.RetrieveAPIView):
    """用户个人资料API视图"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_user(request):
    """用户注册API"""
    log_info("用户注册请求", {"request_data": request.data})
    
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(request.data['password'])
            user.save()
            
            # 创建用户设置
            UserSettings.objects.create(user=user)
            
            # 创建Token
            token, created = Token.objects.get_or_create(user=user)
            
            log_info("用户注册成功", {"user_id": user.id, "username": user.username})
            return Response({
                'user': serializer.data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        
        log_warning("用户注册失败", {"errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def search(request):
    """Search API"""
    query = request.query_params.get('q', '')
    if not query:
        return Response({"error": "Search keyword is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Search routes
    routes = Route.objects.filter(name__icontains=query) | Route.objects.filter(route_number__icontains=query)
    route_serializer = RouteSerializer(routes, many=True)
    
    # Search stops
    stops = Stop.objects.filter(name__icontains=query)
    stop_serializer = StopSerializer(stops, many=True)
    
    return Response({
        'routes': route_serializer.data,
        'stops': stop_serializer.data
    })

# Add missing logout function
def logout_user(request):
    """User Logout View"""
    logout(request)
    return JsonResponse({
        'success': True,
        'message': 'Successfully logged out'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def api_docs(request):
    """API Documentation View"""
    return render(request, 'api/docs.html', {
        'title': 'API Documentation',
        'endpoints': [
            {'name': 'Transport Types', 'url': '/api/transport-types/'},
            {'name': 'Routes', 'url': '/api/routes/'},
            {'name': 'Stops', 'url': '/api/stops/'},
            {'name': 'Schedules', 'url': '/api/schedules/'},
            {'name': 'System Status', 'url': '/api/system-status/'},
            {'name': 'User Routes', 'url': '/api/user-routes/'},
            {'name': 'User Settings', 'url': '/api/user-settings/'},
            {'name': 'Search', 'url': '/api/search/'},
        ]
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """请求密码重置API"""
    email = request.data.get('email')
    
    log_info("密码重置请求", {"email": email})
    
    if not email:
        log_warning("密码重置失败：缺少邮箱", {"request_data": request.data})
        return Response({
            'error': '请提供电子邮箱'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # 生成密码重置令牌
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # 发送密码重置邮件
        from django.core.mail import send_mail
        from django.template.loader import render_to_string
        from django.conf import settings
        
        reset_url = f"{request.scheme}://{request.get_host()}/reset-password/{uid}/{token}/"
        
        message = render_to_string('password_reset_email.html', {
            'user': user,
            'reset_url': reset_url,
            'site_name': 'Transit App'
        })
        
        send_mail(
            '密码重置请求',
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False
        )
        
        log_info("密码重置邮件已发送", {"user_id": user.id, "email": email})
        return Response({
            'message': '密码重置邮件已发送'
        })
    except User.DoesNotExist:
        log_warning("密码重置失败：用户不存在", {"email": email})
        return Response({
            'error': '该邮箱未注册'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        log_error("密码重置过程中出错", exc=e, extra={"email": email})
        return Response({
            'error': '发送密码重置邮件时出错'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, uidb64, token):
    """重置密码API"""
    log_info("密码重置验证", {"uidb64": uidb64, "token": token})
    
    try:
        from django.utils.http import urlsafe_base64_decode
        from django.contrib.auth.tokens import default_token_generator
        
        # 解码用户ID
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
        
        # 验证令牌
        if default_token_generator.check_token(user, token):
            password = request.data.get('password')
            
            if not password:
                log_warning("密码重置失败：缺少新密码", {"user_id": user.id})
                return Response({
                    'error': '请提供新密码'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 设置新密码
            user.set_password(password)
            user.save()
            
            log_info("密码重置成功", {"user_id": user.id, "username": user.username})
            return Response({
                'message': '密码已成功重置'
            })
        else:
            log_warning("密码重置失败：无效的令牌", {"user_id": user.id, "token": token})
            return Response({
                'error': '无效的密码重置链接'
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        log_error("密码重置过程中出错", exc=e, extra={"uidb64": uidb64, "token": token})
        return Response({
            'error': '重置密码时出错'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """管理员仪表板API"""
    if not request.user.is_staff:
        log_warning("非管理员用户尝试访问管理员仪表板", {"user_id": request.user.id, "username": request.user.username})
        return Response({
            'error': '权限不足'
        }, status=status.HTTP_403_FORBIDDEN)
    
    log_info("管理员访问仪表板", {"admin_id": request.user.id, "admin_username": request.user.username})
    
    try:
        # 获取系统统计信息
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        total_routes = Route.objects.count()
        total_stops = Stop.objects.count()
        
        # 获取最近注册的用户
        recent_users = User.objects.all().order_by('-date_joined')[:5]
        recent_users_data = UserSerializer(recent_users, many=True).data
        
        # 获取系统状态
        system_statuses = SystemStatus.objects.all()
        statuses_data = SystemStatusSerializer(system_statuses, many=True).data
        
        # 获取最近的通知
        recent_notifications = Notification.objects.all().order_by('-created_at')[:5]
        notifications_data = NotificationSerializer(recent_notifications, many=True).data
        
        dashboard_data = {
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'total_routes': total_routes,
                'total_stops': total_stops,
            },
            'recent_users': recent_users_data,
            'system_statuses': statuses_data,
            'recent_notifications': notifications_data
        }
        
        log_debug("管理员仪表板数据已生成", {"data_summary": {
            "total_users": total_users,
            "active_users": active_users,
            "total_routes": total_routes,
            "total_stops": total_stops
        }})
        
        return Response(dashboard_data)
    except Exception as e:
        log_error("生成管理员仪表板数据时出错", exc=e, extra={"admin_id": request.user.id})
        return Response({
            'error': '获取仪表板数据时出错'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_user(request):
    """用户登录API"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    log_info("用户登录请求", {"username": username})
    
    if not username or not password:
        log_warning("登录失败：缺少用户名或密码", {"username": username})
        return Response({
            'error': '请提供用户名和密码'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if not user:
        # 尝试使用邮箱登录
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
    
    if user:
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        
        log_info("用户登录成功", {"user_id": user.id, "username": user.username})
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff
            }
        })
    else:
        log_warning("登录失败：无效的凭据", {"username": username})
        return Response({
            'error': '无效的凭据'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """修改密码API"""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    log_info("用户请求修改密码", {"user_id": user.id, "username": user.username})
    
    if not old_password or not new_password:
        log_warning("修改密码失败：缺少旧密码或新密码", {"user_id": user.id})
        return Response({
            'error': '请提供旧密码和新密码'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 验证旧密码
    if not user.check_password(old_password):
        log_warning("修改密码失败：旧密码不正确", {"user_id": user.id})
        return Response({
            'error': '旧密码不正确'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 设置新密码
    user.set_password(new_password)
    user.save()
    
    # 更新Token
    Token.objects.filter(user=user).delete()
    token, created = Token.objects.get_or_create(user=user)
    
    log_info("用户密码修改成功", {"user_id": user.id, "username": user.username})
    return Response({
        'message': '密码已成功修改',
        'token': token.key
    })

@api_view(['GET'])
@permission_classes([AllowAny])
@cached(timeout=60*5)  # 缓存5分钟
def homepage_data(request):
    """获取首页数据，包括热门路线、系统状态和通知"""
    log_api_request(request, "获取首页数据")
    
    try:
        # 获取热门路线（这里简单地获取最近更新的路线）
        popular_routes = Route.objects.filter(is_active=True).order_by('-updated_at')[:5]
        
        # 获取最新系统状态
        try:
            latest_status = SystemStatus.objects.latest('created_at')
            system_status = SystemStatusSerializer(latest_status).data
        except SystemStatus.DoesNotExist:
            system_status = None
        
        # 获取最新通知
        notifications = Notification.objects.filter(
            is_active=True,
            expiry_date__gt=timezone.now()
        ).order_by('-created_at')[:5]
        
        # 组装响应数据
        response_data = {
            'popular_routes': RouteSerializer(popular_routes, many=True).data,
            'system_status': system_status,
            'notifications': NotificationSerializer(notifications, many=True).data,
            'last_updated': timezone.now().isoformat()
        }
        
        log_info("首页数据获取成功")
        return Response(response_data)
    except Exception as e:
        log_error(f"获取首页数据失败: {str(e)}", exc_info=True)
        return Response(
            {"error": "获取首页数据失败"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
