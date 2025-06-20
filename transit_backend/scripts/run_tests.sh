#!/bin/bash

# 运行测试的Shell脚本
# 此脚本会设置测试数据库并运行所有测试

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始测试流程...${NC}"

# 检查虚拟环境
if [ -z "$VIRTUAL_ENV" ]; then
  echo -e "${YELLOW}提示: 未检测到虚拟环境。如果你使用虚拟环境，请先激活它。${NC}"
  echo -e "例如: source venv/bin/activate"
  echo ""
fi

# 设置测试数据库
echo -e "${YELLOW}设置测试数据库...${NC}"
python scripts/setup_test_db.py

if [ $? -ne 0 ]; then
  echo -e "${RED}设置测试数据库失败！${NC}"
  exit 1
fi

echo ""

# 运行Django测试
echo -e "${YELLOW}运行后端单元测试...${NC}"
python manage.py test

if [ $? -ne 0 ]; then
  echo -e "${RED}后端单元测试失败！${NC}"
  exit 1
fi

echo -e "${GREEN}所有测试通过！${NC}"
exit 0 