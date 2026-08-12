# Node Lean - Node.js 管理系统

一个基于 Node.js + Express + MySQL + Vue3 + TypeScript 构建的现代化后台管理系统。

## ✨ 特性

- 🚀 **现代化技术栈** - Vue 3 + TypeScript + Vite + Element Plus
- 🔐 **完善的认证系统** - JWT Token 认证
- 👥 **用户管理** - 用户 CRUD、状态管理、批量操作
- 🎨 **优雅的 UI** - 基于 Element Plus 的响应式界面
- 📦 **状态管理** - Pinia 状态管理
- 🛡️ **类型安全** - 完整的 TypeScript 类型支持
- 🔌 **RESTful API** - 规范的 API 设计
- 📝 **代码规范** - 统一的代码风格

## 📦 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI 框架**: Element Plus
- **HTTP 客户端**: Axios
- **图标**: Element Plus Icons

### 后端
- **运行环境**: Node.js
- **框架**: Express
- **数据库**: MySQL
- **ORM**: Sequelize
- **认证**: JWT (jsonwebtoken)
- **密码加密**: Bcrypt
- **日志**: Winston
- **验证**: Joi

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd node_lean
```

2. **安装后端依赖**
```bash
npm install
```

3. **配置数据库**

创建 MySQL 数据库：
```sql
CREATE DATABASE node_lean CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

编辑 `.env` 文件，配置数据库连接：
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=node_lean
DB_USER=root
DB_PASSWORD=your_password
```

4. **启动后端服务**
```bash
npm start
```

后端服务将运行在 http://localhost:3000

5. **安装前端依赖**
```bash
cd web
npm install
```

6. **启动前端服务**
```bash
npm run dev
```

前端应用将运行在 http://localhost:5173

## 📁 项目结构

```
node_lean/
├── src/                        # 后端源码
│   ├── config/                # 配置文件
│   │   ├── database.js       # 数据库配置
│   │   └── initData.js       # 初始化数据
│   ├── controllers/          # 控制器
│   │   ├── authController.js # 认证控制器
│   │   └── userController.js # 用户控制器
│   ├── middlewares/          # 中间件
│   │   ├── auth.js          # JWT 认证中间件
│   │   ├── errorHandler.js  # 错误处理中间件
│   │   ├── permission.js    # 权限中间件
│   │   └── validator.js     # 验证中间件
│   ├── models/              # 数据模型
│   │   ├── User.js          # 用户模型
│   │   ├── Role.js          # 角色模型
│   │   ├── Permission.js    # 权限模型
│   │   └── index.js         # 模型聚合
│   ├── routes/              # 路由
│   │   ├── auth.js          # 认证路由
│   │   └── user.js          # 用户路由
│   ├── services/            # 业务逻辑
│   │   ├── authService.js   # 认证服务
│   │   └── userService.js   # 用户服务
│   ├── utils/               # 工具函数
│   │   ├── logger.js        # 日志工具
│   │   ├── response.js      # 响应格式
│   │   └── validators.js    # 验证规则
│   └── app.js               # Express 应用
├── web/                      # 前端源码
│   ├── public/              # 静态资源
│   ├── src/
│   │   ├── api/            # API 接口
│   │   │   ├── auth.ts    # 认证 API
│   │   │   └── user.ts    # 用户 API
│   │   ├── assets/         # 资源文件
│   │   ├── components/     # 公共组件
│   │   ├── router/         # 路由配置
│   │   │   └── index.ts
│   │   ├── store/          # 状态管理
│   │   │   └── user.ts    # 用户状态
│   │   ├── types/          # TypeScript 类型
│   │   │   └── api.ts     # API 类型定义
│   │   ├── utils/          # 工具函数
│   │   │   └── request.ts # Axios 封装
│   │   ├── views/          # 页面组件
│   │   │   ├── Login.vue           # 登录页
│   │   │   ├── Register.vue        # 注册页
│   │   │   ├── Layout.vue          # 布局组件
│   │   │   ├── Dashboard.vue       # 仪表板
│   │   │   ├── Profile.vue         # 个人中心
│   │   │   ├── UserManagement.vue  # 用户管理
│   │   │   └── NotFound.vue        # 404页面
│   │   ├── App.vue         # 根组件
│   │   ├── main.ts         # 入口文件
│   │   └── style.css       # 全局样式
│   ├── index.html          # HTML 模板
│   ├── package.json        # 项目依赖
│   ├── tsconfig.json       # TS 配置
│   └── vite.config.ts      # Vite 配置
├── .env                     # 环境变量
├── server.js               # 后端入口
├── package.json            # 后端依赖
├── TODO.md                 # 待开发功能清单
└── README.md               # 项目说明
```

## 🔑 默认账号

- **管理员账号**
  - 用户名: `admin`
  - 密码: `admin123`

## 📚 已实现功能

### 认证系统
- ✅ 用户登录
- ✅ 用户注册
- ✅ JWT Token 认证
- ✅ Token 自动管理
- ✅ 登出功能

### 用户管理
- ✅ 用户列表（分页、排序）
- ✅ 用户搜索（用户名、邮箱、状态）
- ✅ 新增用户
- ✅ 编辑用户
- ✅ 查看用户详情
- ✅ 删除用户（单个/批量）
- ✅ 用户状态管理

### 个人中心
- ✅ 查看个人信息
- ✅ 编辑个人信息
- ✅ 修改密码

### 系统功能
- ✅ 路由守卫
- ✅ 统一错误处理
- ✅ 请求/响应拦截
- ✅ 表单验证
- ✅ 响应式布局

## 🛣️ 路由说明

### 前端路由

| 路径 | 说明 | 权限 |
|------|------|------|
| `/login` | 登录页面 | 公开 |
| `/register` | 注册页面 | 公开 |
| `/` | 主布局 | 需登录 |
| `/dashboard` | 仪表板 | 需登录 |
| `/users` | 用户管理 | 需登录 |
| `/profile` | 个人中心 | 需登录 |

### 后端 API

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 公开 |
| POST | `/api/auth/login` | 用户登录 | 公开 |
| GET | `/api/auth/profile` | 获取个人信息 | 需登录 |
| PUT | `/api/auth/profile` | 更新个人信息 | 需登录 |
| POST | `/api/auth/change-password` | 修改密码 | 需登录 |
| POST | `/api/auth/logout` | 登出 | 需登录 |
| GET | `/api/users` | 获取用户列表 | 需登录 |
| GET | `/api/users/:id` | 获取用户详情 | 需登录 |
| POST | `/api/users` | 创建用户 | 需登录 |
| PUT | `/api/users/:id` | 更新用户 | 需登录 |
| DELETE | `/api/users/:id` | 删除用户 | 需登录 |
| POST | `/api/users/batch-delete` | 批量删除用户 | 需登录 |

## 📝 开发指南

### 添加新的 API

1. 在 `src/services/` 创建服务层
2. 在 `src/controllers/` 创建控制器
3. 在 `src/routes/` 创建路由
4. 在 `src/app.js` 注册路由

### 添加新的页面

1. 在 `web/src/views/` 创建 Vue 组件
2. 在 `web/src/router/index.ts` 添加路由配置
3. 在 `web/src/api/` 添加 API 接口（如需要）

## 🔒 安全特性

- 密码使用 Bcrypt 加密存储
- JWT Token 认证机制
- 请求参数验证
- SQL 注入防护（Sequelize ORM）
- XSS 防护（Helmet 中间件）
- CORS 跨域配置
- 防止删除管理员账号
- 防止删除当前登录用户

## 📄 License

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- Issue: [项目 Issues](https://github.com/your-repo/issues)
- Email: your-email@example.com
