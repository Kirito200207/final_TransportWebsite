"""
缓存工具模块

提供便捷的缓存操作函数，用于缓存昂贵查询或频繁访问的数据。
"""

import json
import hashlib
import logging
from functools import wraps
from django.core.cache import cache, caches
from django.conf import settings

# 获取日志记录器
logger = logging.getLogger('api')

# 默认缓存时间（秒）
DEFAULT_CACHE_TTL = 60 * 15  # 15分钟

def get_cache_key(prefix, *args, **kwargs):
    """
    生成缓存键
    
    Args:
        prefix: 缓存键前缀
        args: 位置参数
        kwargs: 关键字参数
        
    Returns:
        str: 缓存键
    """
    # 将参数转换为字符串
    args_str = ':'.join([str(arg) for arg in args])
    kwargs_str = ':'.join([f"{k}={v}" for k, v in sorted(kwargs.items())])
    
    # 组合参数字符串
    params_str = f"{args_str}:{kwargs_str}" if args_str and kwargs_str else args_str or kwargs_str
    
    # 如果参数字符串太长，使用其哈希值
    if len(params_str) > 200:
        params_str = hashlib.md5(params_str.encode()).hexdigest()
    
    # 组合缓存键
    if params_str:
        return f"{prefix}:{params_str}"
    return prefix

def cache_data(key, data, timeout=DEFAULT_CACHE_TTL):
    """
    缓存数据
    
    Args:
        key: 缓存键
        data: 要缓存的数据
        timeout: 缓存超时时间（秒）
        
    Returns:
        bool: 是否成功缓存
    """
    success = False
    
    # 尝试使用Redis缓存
    try:
        cache.set(key, data, timeout)
        logger.debug(f"数据已缓存到Redis，键: {key}, 超时: {timeout}秒")
        success = True
    except Exception as e:
        logger.error(f"缓存数据到Redis失败，键: {key}", exc_info=True)
        
        # 尝试使用本地内存缓存
        try:
            local_cache = caches['local']
            local_cache.set(key, data, timeout)
            logger.debug(f"数据已缓存到本地内存，键: {key}, 超时: {timeout}秒")
            success = True
        except Exception as e:
            logger.error(f"缓存数据到本地内存失败，键: {key}", exc_info=True)
    
    return success

def get_cached_data(key, default=None):
    """
    获取缓存的数据
    
    Args:
        key: 缓存键
        default: 默认值，如果缓存中没有数据
        
    Returns:
        缓存的数据或默认值
    """
    data = default
    
    # 尝试从Redis获取数据
    try:
        data = cache.get(key, None)
        if data is not None:
            logger.debug(f"Redis缓存命中，键: {key}")
            return data
        logger.debug(f"Redis缓存未命中，键: {key}")
    except Exception as e:
        logger.error(f"从Redis获取缓存数据失败，键: {key}", exc_info=True)
    
    # 如果Redis失败，尝试从本地内存缓存获取
    try:
        local_cache = caches['local']
        data = local_cache.get(key, default)
        if data is not None:
            logger.debug(f"本地内存缓存命中，键: {key}")
        else:
            logger.debug(f"本地内存缓存未命中，键: {key}")
    except Exception as e:
        logger.error(f"从本地内存获取缓存数据失败，键: {key}", exc_info=True)
    
    return data

def delete_cache(key):
    """
    删除缓存
    
    Args:
        key: 缓存键
        
    Returns:
        bool: 是否成功删除
    """
    success = False
    
    # 尝试从Redis删除
    try:
        cache.delete(key)
        logger.debug(f"Redis缓存已删除，键: {key}")
        success = True
    except Exception as e:
        logger.error(f"从Redis删除缓存失败，键: {key}", exc_info=True)
    
    # 尝试从本地内存缓存删除
    try:
        local_cache = caches['local']
        local_cache.delete(key)
        logger.debug(f"本地内存缓存已删除，键: {key}")
        success = True
    except Exception as e:
        logger.error(f"从本地内存删除缓存失败，键: {key}", exc_info=True)
    
    return success

def clear_cache_pattern(pattern):
    """
    清除匹配模式的缓存
    
    Args:
        pattern: 缓存键模式
        
    Returns:
        bool: 是否成功清除
    """
    success = False
    
    # 尝试从Redis清除
    try:
        # 注意：这个功能需要使用django-redis作为缓存后端
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern(f"*{pattern}*")
            logger.debug(f"已清除Redis中匹配模式的缓存，模式: {pattern}")
            success = True
        else:
            logger.warning(f"Redis缓存后端不支持按模式删除，模式: {pattern}")
    except Exception as e:
        logger.error(f"从Redis清除缓存模式失败，模式: {pattern}", exc_info=True)
    
    # 本地内存缓存不支持模式删除，可以考虑其他方法
    
    return success

def cached(timeout=DEFAULT_CACHE_TTL, prefix=None, key_func=None):
    """
    缓存装饰器，用于缓存函数返回值
    
    Args:
        timeout: 缓存超时时间（秒）
        prefix: 缓存键前缀，默认为函数名
        key_func: 自定义缓存键生成函数
        
    Returns:
        装饰器函数
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 确定缓存键前缀
            cache_prefix = prefix or func.__name__
            
            # 生成缓存键
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = get_cache_key(cache_prefix, *args, **kwargs)
            
            # 尝试从缓存获取数据
            cached_result = get_cached_data(cache_key)
            if cached_result is not None:
                return cached_result
            
            # 如果缓存中没有，执行函数并缓存结果
            result = func(*args, **kwargs)
            cache_data(cache_key, result, timeout)
            return result
        return wrapper
    return decorator

def invalidate_cache(prefix=None, key_func=None):
    """
    缓存失效装饰器，用于使缓存失效
    
    Args:
        prefix: 缓存键前缀
        key_func: 自定义缓存键生成函数
        
    Returns:
        装饰器函数
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 执行原函数
            result = func(*args, **kwargs)
            
            # 使缓存失效
            if key_func:
                cache_key = key_func(*args, **kwargs)
                delete_cache(cache_key)
            elif prefix:
                clear_cache_pattern(prefix)
            
            return result
        return wrapper
    return decorator 