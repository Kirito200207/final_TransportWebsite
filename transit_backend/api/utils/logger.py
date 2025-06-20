"""
日志工具模块

提供便捷的日志记录函数，用于在项目中进行结构化日志记录。
"""

import logging
import traceback
import json
from functools import wraps
import time

# 获取API应用的日志记录器
api_logger = logging.getLogger('api')

def log_info(message, extra=None):
    """
    记录INFO级别的日志
    
    Args:
        message: 日志消息
        extra: 额外的日志信息，字典格式
    """
    if extra is None:
        extra = {}
    api_logger.info(message, extra=extra)

def log_debug(message, extra=None):
    """
    记录DEBUG级别的日志
    
    Args:
        message: 日志消息
        extra: 额外的日志信息，字典格式
    """
    if extra is None:
        extra = {}
    api_logger.debug(message, extra=extra)

def log_warning(message, extra=None):
    """
    记录WARNING级别的日志
    
    Args:
        message: 日志消息
        extra: 额外的日志信息，字典格式
    """
    if extra is None:
        extra = {}
    api_logger.warning(message, extra=extra)

def log_error(message, exc=None, extra=None):
    """
    记录ERROR级别的日志
    
    Args:
        message: 日志消息
        exc: 异常对象
        extra: 额外的日志信息，字典格式
    """
    if extra is None:
        extra = {}
    
    if exc:
        error_details = {
            'exception_type': type(exc).__name__,
            'exception_message': str(exc),
            'traceback': traceback.format_exc()
        }
        extra.update(error_details)
    
    api_logger.error(message, extra=extra)

def log_critical(message, exc=None, extra=None):
    """
    记录CRITICAL级别的日志
    
    Args:
        message: 日志消息
        exc: 异常对象
        extra: 额外的日志信息，字典格式
    """
    if extra is None:
        extra = {}
    
    if exc:
        error_details = {
            'exception_type': type(exc).__name__,
            'exception_message': str(exc),
            'traceback': traceback.format_exc()
        }
        extra.update(error_details)
    
    api_logger.critical(message, extra=extra)

def log_function_call(func):
    """
    装饰器：记录函数调用的日志
    
    记录函数的进入和退出，以及执行时间
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        func_name = func.__name__
        log_info(f"Entering function: {func_name}")
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            end_time = time.time()
            execution_time = end_time - start_time
            log_info(f"Exiting function: {func_name}", {
                'execution_time': execution_time,
                'status': 'success'
            })
            return result
        except Exception as e:
            end_time = time.time()
            execution_time = end_time - start_time
            log_error(f"Error in function: {func_name}", exc=e, extra={
                'execution_time': execution_time,
                'status': 'error'
            })
            raise
    
    return wrapper

def log_api_request(func):
    """
    装饰器：记录API请求的日志
    
    记录API请求的详细信息，包括请求方法、路径、参数等
    """
    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        view_name = self.__class__.__name__
        method = request.method
        path = request.path
        
        # 记录请求信息
        request_data = {}
        if method in ('POST', 'PUT', 'PATCH'):
            try:
                request_data = request.data
            except:
                request_data = {'error': 'Unable to parse request data'}
        
        query_params = dict(request.query_params)
        
        # 记录用户信息
        user_info = {
            'user_id': request.user.id if request.user.is_authenticated else None,
            'username': request.user.username if request.user.is_authenticated else None,
            'is_authenticated': request.user.is_authenticated
        }
        
        log_info(f"API Request: {method} {path}", {
            'view': view_name,
            'method': method,
            'path': path,
            'query_params': query_params,
            'request_data': request_data,
            'user': user_info
        })
        
        start_time = time.time()
        
        try:
            response = func(self, request, *args, **kwargs)
            end_time = time.time()
            execution_time = end_time - start_time
            
            # 记录响应信息
            status_code = getattr(response, 'status_code', None)
            
            log_info(f"API Response: {status_code} for {method} {path}", {
                'view': view_name,
                'method': method,
                'path': path,
                'status_code': status_code,
                'execution_time': execution_time,
                'status': 'success'
            })
            
            return response
        except Exception as e:
            end_time = time.time()
            execution_time = end_time - start_time
            
            log_error(f"API Error: {method} {path}", exc=e, extra={
                'view': view_name,
                'method': method,
                'path': path,
                'execution_time': execution_time,
                'status': 'error'
            })
            
            raise
    
    return wrapper 