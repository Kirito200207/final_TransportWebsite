#!/bin/bash

# 设置环境变量
export ENV=prod

# 停止并移除之前的容器
docker-compose -f docker-compose.prod.yml down

# 构建并启动容器
docker-compose -f docker-compose.prod.yml up --build -d

# 显示容器状态
docker-compose -f docker-compose.prod.yml ps

echo "生产环境已启动！访问 https://your-domain.com 查看应用。" 