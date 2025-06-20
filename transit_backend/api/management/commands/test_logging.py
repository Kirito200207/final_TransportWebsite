"""
测试日志记录功能的管理命令

用法: python manage.py test_logging
"""

from django.core.management.base import BaseCommand
import logging
import time
import os
from django.conf import settings

# 获取不同级别的日志记录器
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = '测试日志系统功能'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('开始测试日志系统...'))
        
        # 测试不同级别的日志
        self.test_log_levels()
        
        # 测试结构化日志
        self.test_structured_logging()
        
        # 测试日志文件
        self.test_log_file()
        
        # 测试日志性能
        self.test_log_performance()
        
        self.stdout.write(self.style.SUCCESS('日志系统测试完成!'))
    
    def test_log_levels(self):
        """测试不同级别的日志记录"""
        self.stdout.write('测试不同级别的日志记录...')
        
        logger.debug('这是一条DEBUG级别的日志消息')
        logger.info('这是一条INFO级别的日志消息')
        logger.warning('这是一条WARNING级别的日志消息')
        logger.error('这是一条ERROR级别的日志消息')
        logger.critical('这是一条CRITICAL级别的日志消息')
        
        self.stdout.write(self.style.SUCCESS('不同级别的日志记录测试完成!'))
    
    def test_structured_logging(self):
        """测试结构化日志记录"""
        self.stdout.write('测试结构化日志记录...')
        
        # 模拟请求信息
        request_data = {
            'method': 'GET',
            'path': '/api/routes/',
            'user_id': 1001,
            'ip': '192.168.1.100'
        }
        
        # 记录带有额外上下文的日志
        logger.info(
            '用户请求API',
            extra={
                'request_method': request_data['method'],
                'request_path': request_data['path'],
                'user_id': request_data['user_id'],
                'client_ip': request_data['ip']
            }
        )
        
        # 记录错误日志
        try:
            # 模拟一个异常
            result = 1 / 0
        except Exception as e:
            logger.error(
                '处理请求时发生错误',
                exc_info=True,
                extra={
                    'request_path': request_data['path'],
                    'error_type': type(e).__name__
                }
            )
        
        self.stdout.write(self.style.SUCCESS('结构化日志记录测试完成!'))
    
    def test_log_file(self):
        """测试日志文件记录"""
        self.stdout.write('测试日志文件记录...')
        
        # 获取日志文件路径
        log_file = os.path.join(settings.BASE_DIR, 'logs/transit_backend.log')
        
        # 检查日志文件是否存在
        if os.path.exists(log_file):
            # 获取文件大小
            file_size = os.path.getsize(log_file)
            self.stdout.write(f'日志文件存在，大小: {file_size / 1024:.2f} KB')
            
            # 记录一条特殊的日志消息
            test_message = f'日志文件测试消息 - {time.time()}'
            logger.info(test_message)
            
            # 等待日志写入
            time.sleep(1)
            
            # 检查日志是否已写入文件
            try:
                with open(log_file, 'r', encoding='utf-8') as f:
                    last_lines = f.readlines()[-10:]  # 读取最后10行
                    found = any(test_message in line for line in last_lines)
                    
                    if found:
                        self.stdout.write(self.style.SUCCESS('日志成功写入文件!'))
                    else:
                        self.stdout.write(self.style.WARNING('未在日志文件中找到测试消息'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'读取日志文件失败: {str(e)}'))
        else:
            self.stdout.write(self.style.WARNING(f'日志文件不存在: {log_file}'))
            # 尝试创建日志目录
            os.makedirs(os.path.dirname(log_file), exist_ok=True)
            self.stdout.write('已创建日志目录，请再次运行测试')
        
        self.stdout.write(self.style.SUCCESS('日志文件记录测试完成!'))
    
    def test_log_performance(self):
        """测试日志性能"""
        self.stdout.write('测试日志性能...')
        
        iterations = 1000
        
        # 测试简单日志性能
        start_time = time.time()
        for i in range(iterations):
            logger.info(f'性能测试日志 #{i}')
        simple_time = time.time() - start_time
        
        # 测试结构化日志性能
        start_time = time.time()
        for i in range(iterations):
            logger.info(
                f'结构化性能测试 #{i}',
                extra={
                    'iteration': i,
                    'timestamp': time.time(),
                    'test_type': 'performance',
                    'data': {'value1': i, 'value2': i*2}
                }
            )
        structured_time = time.time() - start_time
        
        # 输出性能结果
        self.stdout.write(f'记录 {iterations} 条简单日志耗时: {simple_time:.4f}秒')
        self.stdout.write(f'记录 {iterations} 条结构化日志耗时: {structured_time:.4f}秒')
        self.stdout.write(f'平均简单日志时间: {(simple_time/iterations)*1000:.4f}毫秒/条')
        self.stdout.write(f'平均结构化日志时间: {(structured_time/iterations)*1000:.4f}毫秒/条')
        
        self.stdout.write(self.style.SUCCESS('日志性能测试完成!')) 