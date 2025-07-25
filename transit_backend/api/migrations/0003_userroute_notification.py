# Generated by Django 5.2.1 on 2025-05-30 14:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0002_usersettings'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserRoute',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=100, verbose_name='路线别名')),
                ('is_favorite', models.BooleanField(default=False, verbose_name='是否收藏')),
                ('from_stop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='from_routes', to='api.stop', verbose_name='起始站点')),
                ('route', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='users', to='api.route', verbose_name='路线')),
                ('to_stop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='to_routes', to='api.stop', verbose_name='终点站点')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='routes', to=settings.AUTH_USER_MODEL, verbose_name='用户')),
            ],
            options={
                'verbose_name': '用户路线',
                'verbose_name_plural': '用户路线',
            },
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100, verbose_name='标题')),
                ('message', models.TextField(verbose_name='消息内容')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='创建时间')),
                ('is_read', models.BooleanField(default=False, verbose_name='是否已读')),
                ('route', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='notifications', to='api.route', verbose_name='相关路线')),
                ('transport_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='notifications', to='api.transporttype', verbose_name='相关交通类型')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL, verbose_name='用户')),
            ],
            options={
                'verbose_name': '通知',
                'verbose_name_plural': '通知',
                'ordering': ['-created_at'],
            },
        ),
    ] 