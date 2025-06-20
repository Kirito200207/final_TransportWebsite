#!/bin/bash

# 设置环境变量
export ENV=dev

# 停止并移除之前的容器
docker-compose down

# 构建并启动容器
docker-compose up --build -d

# 显示容器状态
docker-compose ps

echo "开发环境已启动！访问 http://localhost 查看应用。" 