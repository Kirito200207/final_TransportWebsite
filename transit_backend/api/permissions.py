from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    允许只有管理员用户访问的自定义权限
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    允许管理员完全访问，其他用户只能读取的自定义权限
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_staff

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    允许对象所有者或管理员访问的自定义权限
    """
    def has_object_permission(self, request, view, obj):
        # 管理员可以访问所有对象
        if request.user and request.user.is_staff:
            return True
            
        # 检查对象是否有user属性
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        return False 