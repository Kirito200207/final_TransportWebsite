"""
测试缓存功能的管理命令
"""

import time
from django.core.management.base import BaseCommand
from django.core.cache import cache
from api.utils.cache_utils import cache_data, get_cached_data, delete_cache
from api.models import Route, Stop
from api.serializers import RouteSerializer, StopSerializer
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = '测试缓存功能是否正常工作'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('开始测试缓存功能...'))
        
        # 测试基本缓存功能
        self.test_basic_cache()
        
        # 测试缓存过期
        self.test_cache_expiry()
        
        # 测试缓存删除
        self.test_cache_deletion()
        
        # 测试缓存性能
        self.test_cache_performance()
        
        self.stdout.write(self.style.SUCCESS('缓存功能测试完成!'))
    
    def test_basic_cache(self):
        """测试基本的缓存设置和获取功能"""
        self.stdout.write('测试基本缓存功能...')
        
        # 设置缓存
        cache.set('test_key', 'test_value', 60)
        
        # 获取缓存
        value = cache.get('test_key')
        
        if value == 'test_value':
            self.stdout.write(self.style.SUCCESS('基本缓存功能正常!'))
        else:
            self.stdout.write(self.style.ERROR(f'基本缓存功能异常! 期望: test_value, 实际: {value}'))
    
    def test_cache_expiry(self):
        """测试缓存过期功能"""
        self.stdout.write('测试缓存过期功能...')
        
        # 设置一个短期缓存
        cache.set('expiry_test', 'will_expire', 2)
        
        # 立即检查
        value = cache.get('expiry_test')
        if value == 'will_expire':
            self.stdout.write('缓存设置成功...')
        else:
            self.stdout.write(self.style.ERROR('缓存设置失败!'))
            return
        
        # 等待过期
        self.stdout.write('等待缓存过期...')
        time.sleep(3)
        
        # 再次检查
        value = cache.get('expiry_test')
        if value is None:
            self.stdout.write(self.style.SUCCESS('缓存过期功能正常!'))
        else:
            self.stdout.write(self.style.ERROR(f'缓存过期功能异常! 期望: None, 实际: {value}'))
    
    def test_cache_deletion(self):
        """测试缓存删除功能"""
        self.stdout.write('测试缓存删除功能...')
        
        # 设置缓存
        cache.set('delete_test', 'to_be_deleted', 60)
        
        # 确认设置成功
        value = cache.get('delete_test')
        if value != 'to_be_deleted':
            self.stdout.write(self.style.ERROR('缓存设置失败!'))
            return
        
        # 删除缓存
        cache.delete('delete_test')
        
        # 检查是否删除成功
        value = cache.get('delete_test')
        if value is None:
            self.stdout.write(self.style.SUCCESS('缓存删除功能正常!'))
        else:
            self.stdout.write(self.style.ERROR(f'缓存删除功能异常! 期望: None, 实际: {value}'))
    
    def test_cache_performance(self):
        """测试缓存性能"""
        self.stdout.write('测试缓存性能...')
        
        # 准备测试数据
        test_data = {'id': 1, 'name': 'test', 'description': 'This is a test object' * 10}
        iterations = 1000
        
        # 测试写入性能
        start_time = time.time()
        for i in range(iterations):
            cache.set(f'perf_test_{i}', test_data, 60)
        write_time = time.time() - start_time
        
        # 测试读取性能
        start_time = time.time()
        for i in range(iterations):
            cache.get(f'perf_test_{i}')
        read_time = time.time() - start_time
        
        # 清理测试数据
        for i in range(iterations):
            cache.delete(f'perf_test_{i}')
        
        # 输出性能结果
        self.stdout.write(f'写入 {iterations} 条记录耗时: {write_time:.4f}秒')
        self.stdout.write(f'读取 {iterations} 条记录耗时: {read_time:.4f}秒')
        self.stdout.write(f'平均写入时间: {(write_time/iterations)*1000:.4f}毫秒/条')
        self.stdout.write(f'平均读取时间: {(read_time/iterations)*1000:.4f}毫秒/条')
        
        # 记录到日志
        logger.info(f'缓存性能测试: 写入 {iterations} 条记录耗时: {write_time:.4f}秒')
        logger.info(f'缓存性能测试: 读取 {iterations} 条记录耗时: {read_time:.4f}秒')
        
        self.stdout.write(self.style.SUCCESS('缓存性能测试完成!')) 