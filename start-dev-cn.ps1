# Set environment variables
$env:ENV = "dev"

# Stop and remove previous containers
docker-compose down

# Using China mirror to pull images
Write-Host "Pulling Python image..."
docker pull registry.cn-hangzhou.aliyuncs.com/library/python:3.9-slim
docker tag registry.cn-hangzhou.aliyuncs.com/library/python:3.9-slim python:3.9-slim

Write-Host "Pulling Node image..."
docker pull registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine
docker tag registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine node:20-alpine

Write-Host "Pulling PostgreSQL image..."
docker pull registry.cn-hangzhou.aliyuncs.com/library/postgres:14-alpine
docker tag registry.cn-hangzhou.aliyuncs.com/library/postgres:14-alpine postgres:14-alpine

Write-Host "Pulling Redis image..."
docker pull registry.cn-hangzhou.aliyuncs.com/library/redis:7-alpine
docker tag registry.cn-hangzhou.aliyuncs.com/library/redis:7-alpine redis:7-alpine

# Build and start containers
Write-Host "Starting containers..."
docker-compose up -d

# 显示容器状态
docker-compose ps

Write-Host "Development environment started!"
Write-Host "Access http://localhost:3000 to view the frontend application."
Write-Host "Access http://localhost:8000/api/ to view the backend API." 