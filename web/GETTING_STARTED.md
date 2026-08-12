# 快速开始指南

## 前置要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 安装步骤

### 1. 进入项目目录

```bash
cd web
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动后端服务

在另一个终端窗口中，启动 Node.js 后端服务：

```bash
cd ..
npm start
```

后端服务将运行在 http://localhost:3000

### 4. 启动前端开发服务器

```bash
npm run dev
```

前端应用将运行在 http://localhost:5173

## 使用快速启动脚本

### Windows 用户

双击或在命令行运行：

```bash
start.bat
```

### Linux/Mac 用户

```bash
chmod +x start.sh
./start.sh
```

## 默认测试账号

初始化数据库后，可使用以下账号登录：

- **管理员账号**
  - 用户名: `admin`
  - 密码: `123456`

- **普通用户**
  - 用户名: `user`
  - 密码: `123456`

## 功能说明

### 已实现功能

- ✅ 用户登录
- ✅ 用户注册
- ✅ 个人信息查看
- ✅ 个人信息编辑
- ✅ 密码修改
- ✅ 登出功能
- ✅ 路由守卫（需登录页面保护）
- ✅ Token 自动管理
- ✅ 统一错误处理
- ✅ 响应拦截

### 页面路由

- `/login` - 登录页面
- `/register` - 注册页面
- `/dashboard` - 仪表板（需登录）
- `/profile` - 个人中心（需登录）

## 项目配置

### API 地址配置

开发环境的 API 代理已在 [vite.config.ts](vite.config.ts) 中配置：

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // 后端地址
      changeOrigin: true
    }
  }
}
```

### 环境变量

- `.env.development` - 开发环境变量
- `.env.production` - 生产环境变量

## 开发建议

### 添加新的 API

在 [src/api/](src/api/) 目录下创建新的 API 文件，参考 [auth.ts](src/api/auth.ts)：

```typescript
import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export const getList = () => {
  return request<ApiResponse<any>>({
    url: '/your-endpoint',
    method: 'get'
  })
}
```

### 添加新的页面

1. 在 [src/views/](src/views/) 创建 Vue 组件
2. 在 [src/router/index.ts](src/router/index.ts) 添加路由配置

### 添加新的状态管理

在 [src/store/](src/store/) 目录下创建新的 store，参考 [user.ts](src/store/user.ts)。

## 常见问题

### 1. 端口被占用

修改 [vite.config.ts](vite.config.ts) 中的端口号：

```typescript
server: {
  port: 3001  // 改为其他端口
}
```

### 2. API 请求失败

检查后端服务是否正常运行在 http://localhost:3000

### 3. 跨域问题

开发环境已通过 Vite 代理解决。生产环境需要后端配置 CORS。

## 生产部署

### 构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 部署

将 `dist/` 目录的内容部署到 Web 服务器（Nginx、Apache 等）。

注意配置 SPA 路由回退：

**Nginx 配置示例：**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}

location /api {
  proxy_pass http://your-backend-server:3000;
}
```

## 技术支持

如有问题，请查看：

- [Vue 3 文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
