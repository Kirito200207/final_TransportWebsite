#!/bin/bash

# 前端测试运行脚本
# 此脚本运行前端单元测试和端到端测试

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始前端测试流程...${NC}"

# 运行单元测试
echo -e "${YELLOW}运行 React 单元测试...${NC}"
npm test -- --watchAll=false

if [ $? -ne 0 ]; then
  echo -e "${RED}单元测试失败！${NC}"
  exit 1
fi

echo -e "${GREEN}单元测试通过！${NC}"
echo ""

# 检查开发服务器是否运行
echo -e "${YELLOW}检查开发服务器...${NC}"
if ! curl -s http://localhost:3000 > /dev/null; then
  echo -e "${YELLOW}开发服务器未运行，正在启动...${NC}"
  echo -e "${YELLOW}(保持此终端打开，在新终端中运行Cypress测试)${NC}"
  npm start
  exit 0
fi

# 运行Cypress测试
echo -e "${YELLOW}运行 Cypress 端到端测试...${NC}"
npx cypress run

if [ $? -ne 0 ]; then
  echo -e "${RED}Cypress 测试失败！${NC}"
  exit 1
fi

echo -e "${GREEN}所有前端测试通过！${NC}"
exit 0 