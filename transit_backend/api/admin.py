from django.contrib import admin
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
from django.urls import path
from .models import (
    TransportType, Route, Stop, RouteStop, Schedule,
    SystemStatus, Notification, UserRoute, UserSettings
)

class RouteStopInline(admin.TabularInline):
    model = RouteStop
    extra = 1
    autocomplete_fields = ['stop']

class ScheduleInline(admin.TabularInline):
    model = Schedule
    extra = 0
    fields = ('stop', 'arrival_time', 'day_of_week')
    autocomplete_fields = ['stop']
    max_num = 10
    
class NotificationInline(admin.TabularInline):
    model = Notification
    extra = 0
    fields = ('title', 'message', 'is_read')
    readonly_fields = ('created_at',)
    max_num = 5

@admin.register(TransportType)
class TransportTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'get_routes_count')
    search_fields = ('name',)
    
    def get_routes_count(self, obj):
        return obj.routes.count()
    get_routes_count.short_description = 'Routes Count'

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('route_number', 'name', 'transport_type', 'is_active', 'frequency', 'get_stops_count')
    list_filter = ('transport_type', 'is_active')
    search_fields = ('route_number', 'name')
    inlines = [RouteStopInline, ScheduleInline]
    actions = ['activate_routes', 'deactivate_routes']
    
    def get_stops_count(self, obj):
        return obj.stops.count()
    get_stops_count.short_description = 'Stops Count'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.prefetch_related('transport_type', 'stops')
        return queryset
    
    def activate_routes(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} routes have been activated.")
    activate_routes.short_description = "Activate selected routes"
    
    def deactivate_routes(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} routes have been deactivated.")
    deactivate_routes.short_description = "Deactivate selected routes"

@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'get_routes_count')
    search_fields = ('name',)
    
    def get_routes_count(self, obj):
        return obj.routes.count()
    get_routes_count.short_description = 'Routes Count'

@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ('route', 'stop', 'order')
    list_filter = ('route',)
    search_fields = ('route__name', 'stop__name')
    autocomplete_fields = ['route', 'stop']
    ordering = ('route', 'order')

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('route', 'stop', 'arrival_time', 'get_day_display')
    list_filter = ('route', 'day_of_week')
    search_fields = ('route__name', 'stop__name')
    autocomplete_fields = ['route', 'stop']
    
    def get_day_display(self, obj):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return days[obj.day_of_week]
    get_day_display.short_description = 'Day'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('route', 'stop')
        return queryset

@admin.register(SystemStatus)
class SystemStatusAdmin(admin.ModelAdmin):
    list_display = ('transport_type', 'status', 'details', 'last_updated')
    list_filter = ('transport_type', 'status')
    readonly_fields = ('last_updated',)
    actions = ['mark_as_good', 'mark_as_warning', 'mark_as_bad']
    
    def mark_as_good(self, request, queryset):
        updated = queryset.update(status='good')
        self.message_user(request, f"{updated} statuses have been marked as good.")
    mark_as_good.short_description = "Mark selected statuses as good"
    
    def mark_as_warning(self, request, queryset):
        updated = queryset.update(status='warning')
        self.message_user(request, f"{updated} statuses have been marked as warning.")
    mark_as_warning.short_description = "Mark selected statuses as warning"
    
    def mark_as_bad(self, request, queryset):
        updated = queryset.update(status='bad')
        self.message_user(request, f"{updated} statuses have been marked as bad.")
    mark_as_bad.short_description = "Mark selected statuses as bad"

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'transport_type', 'route', 'created_at', 'is_read')
    list_filter = ('transport_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__username')
    autocomplete_fields = ['user', 'transport_type', 'route']
    readonly_fields = ('created_at',)
    actions = ['mark_as_read', 'mark_as_unread', 'send_bulk_notification']
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('user', 'transport_type', 'route')
        return queryset
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} notifications have been marked as read.")
    mark_as_read.short_description = "Mark selected notifications as read"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f"{updated} notifications have been marked as unread.")
    mark_as_unread.short_description = "Mark selected notifications as unread"
    
    def send_bulk_notification(self, request, queryset):
        # 这只是一个示例，实际实现可能需要更复杂的逻辑
        # 例如，通过表单让管理员输入要发送的消息
        from django.contrib.auth.models import User
        
        users = User.objects.all()
        count = 0
        
        for notification in queryset:
            for user in users:
                if not Notification.objects.filter(
                    title=notification.title,
                    message=notification.message,
                    user=user
                ).exists():
                    Notification.objects.create(
                        title=notification.title,
                        message=notification.message,
                        transport_type=notification.transport_type,
                        route=notification.route,
                        user=user,
                        is_read=False
                    )
                    count += 1
        
        self.message_user(request, f"{count} new notifications have been sent to users.")
    send_bulk_notification.short_description = "Send selected notifications to all users"

@admin.register(UserRoute)
class UserRouteAdmin(admin.ModelAdmin):
    list_display = ('user', 'route', 'from_stop', 'to_stop', 'name', 'is_favorite')
    list_filter = ('is_favorite', 'user')
    search_fields = ('user__username', 'route__name', 'name')
    autocomplete_fields = ['user', 'route', 'from_stop', 'to_stop']
    actions = ['mark_as_favorite', 'mark_as_not_favorite']
    
    def mark_as_favorite(self, request, queryset):
        updated = queryset.update(is_favorite=True)
        self.message_user(request, f"{updated} routes have been marked as favorite.")
    mark_as_favorite.short_description = "Mark selected routes as favorite"
    
    def mark_as_not_favorite(self, request, queryset):
        updated = queryset.update(is_favorite=False)
        self.message_user(request, f"{updated} routes have been marked as not favorite.")
    mark_as_not_favorite.short_description = "Mark selected routes as not favorite"

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'reminder_enabled', 'notification_enabled')
    list_filter = ('reminder_enabled', 'notification_enabled')
    search_fields = ('user__username',)
    autocomplete_fields = ['user']
    actions = ['enable_reminders', 'disable_reminders', 'enable_notifications', 'disable_notifications']
    
    def enable_reminders(self, request, queryset):
        updated = queryset.update(reminder_enabled=True)
        self.message_user(request, f"Reminders enabled for {updated} users.")
    enable_reminders.short_description = "Enable reminders for selected users"
    
    def disable_reminders(self, request, queryset):
        updated = queryset.update(reminder_enabled=False)
        self.message_user(request, f"Reminders disabled for {updated} users.")
    disable_reminders.short_description = "Disable reminders for selected users"
    
    def enable_notifications(self, request, queryset):
        updated = queryset.update(notification_enabled=True)
        self.message_user(request, f"Notifications enabled for {updated} users.")
    enable_notifications.short_description = "Enable notifications for selected users"
    
    def disable_notifications(self, request, queryset):
        updated = queryset.update(notification_enabled=False)
        self.message_user(request, f"Notifications disabled for {updated} users.")
    disable_notifications.short_description = "Disable notifications for selected users"

# 自定义Admin站点标题和头部
admin.site.site_header = 'Transit System Administration'
admin.site.site_title = 'Transit Admin'
admin.site.index_title = 'Transit Management'
