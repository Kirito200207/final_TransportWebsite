"""
日志中间件

用于记录所有请求的日志中间件。
"""

import time
import json
import logging
import traceback
from django.utils.deprecation import MiddlewareMixin

# 获取API应用的日志记录器
logger = logging.getLogger('api')

class RequestLoggingMiddleware(MiddlewareMixin):
    """
    记录所有请求的中间件
    
    记录请求的方法、路径、状态码、响应时间等信息
    """
    
    def process_request(self, request):
        """处理请求"""
        # 记录请求开始时间
        request.start_time = time.time()
        
        # 记录请求信息
        if not request.path.startswith('/admin/') and not request.path.startswith('/static/'):
            # 排除管理后台和静态文件请求
            logger.info(f"Request: {request.method} {request.path}", extra={
                'method': request.method,
                'path': request.path,
                'user_id': request.user.id if request.user.is_authenticated else None,
                'username': request.user.username if request.user.is_authenticated else None,
                'ip': self._get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            })
        
        return None
    
    def process_response(self, request, response):
        """处理响应"""
        if not hasattr(request, 'start_time'):
            return response
        
        # 计算响应时间
        duration = time.time() - request.start_time
        
        # 记录响应信息
        if not request.path.startswith('/admin/') and not request.path.startswith('/static/'):
            # 排除管理后台和静态文件请求
            logger.info(f"Response: {response.status_code} for {request.method} {request.path}", extra={
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration': round(duration * 1000, 2),  # 毫秒
                'user_id': request.user.id if request.user.is_authenticated else None,
                'ip': self._get_client_ip(request),
            })
        
        return response
    
    def process_exception(self, request, exception):
        """处理异常"""
        logger.error(f"Exception in {request.method} {request.path}: {str(exception)}", extra={
            'method': request.method,
            'path': request.path,
            'exception_type': type(exception).__name__,
            'exception_message': str(exception),
            'traceback': traceback.format_exc(),
            'user_id': request.user.id if request.user.is_authenticated else None,
            'ip': self._get_client_ip(request),
        })
        
        return None
    
    def _get_client_ip(self, request):
        """获取客户端IP地址"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip 