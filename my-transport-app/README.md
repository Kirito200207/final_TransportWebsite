# 公交出行系统前端

基于React的公交出行系统前端应用，提供用户友好的界面来查询公交路线、站点和时刻表。

## 功能特点

- 实时公交路线信息展示
- 站点详情和时刻表查询
- 用户收藏路线和站点
- 系统状态和通知展示
- 移动端响应式设计

## 技术栈

- **React**: UI库
- **React Router**: 路由管理
- **Axios**: API请求
- **FontAwesome**: 图标库
- **React-datepicker**: 日期选择器
- **Jest & Testing Library**: 单元测试
- **Cypress**: 端到端测试

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

### 构建生产版本

```bash
npm run build
```

构建文件将生成在 `build` 目录中。

## 测试

### 运行单元测试

```bash
npm test
```

### 生成测试覆盖率报告

```bash
npm run test:coverage
```

### 运行端到端测试

```bash
# 启动开发服务器并运行测试
npm run test:e2e

# 或者打开Cypress测试界面
npm run cypress:open
```

## 代码质量

项目使用ESLint进行代码质量检查。

### 运行代码检查

```bash
npm run lint
```

### 修复代码风格问题

```bash
npm run lint -- --fix
```

## 目录结构

```
src/
├── components/       # 组件
├── pages/            # 页面
├── services/         # API服务
├── utils/            # 工具函数
├── hooks/            # 自定义钩子
├── context/          # React上下文
├── assets/           # 静态资源
└── App.js            # 应用入口
```

## 与后端集成

前端应用通过API与后端服务通信，API地址可通过环境变量配置：

```
REACT_APP_API_URL=http://localhost/api
```

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request
