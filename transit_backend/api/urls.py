from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'transport-types', views.TransportTypeViewSet)
router.register(r'routes', views.RouteViewSet)
router.register(r'stops', views.StopViewSet)
router.register(r'schedules', views.ScheduleViewSet)
router.register(r'system-status', views.SystemStatusViewSet)
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'user-routes', views.UserRouteViewSet, basename='user-route')
router.register(r'user-settings', views.UserSettingsViewSet, basename='user-setting')
router.register(r'reminders', views.ReminderViewSet, basename='reminder')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('register/', views.register_user, name='register'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('search/', views.search, name='search'),
    path('docs/', views.api_docs, name='api-docs'),
    path('request-password-reset/', views.request_password_reset, name='request-password-reset'),
    path('reset-password/<str:uidb64>/<str:token>/', views.reset_password, name='reset-password'),
    path('change-password/', views.change_password, name='change-password'),
    path('admin-dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('homepage-data/', views.homepage_data, name='homepage-data'),
] 