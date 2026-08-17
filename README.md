# Node Lean 管理系统 - Web 开发完成报告

## 🎉 项目概述

Node Lean 是一个基于 Node.js + Express + Vue 3 + Element Plus 的现代化后台管理系统，包含完整的用户权限管理、工单系统、文件管理和操作日志功能。

## 🚀 系统访问地址

- **前端地址**: http://localhost:5174
- **后端地址**: http://localhost:3000
- **API文档**: http://localhost:3000/health (健康检查)

## 👤 测试账号

| 角色 | 用户名 | 密码 | 权限说明 |
|------|--------|------|----------|
| 管理员 | admin | 123456 | 所有权限（27个） |
| 经理 | manager | password | 用户、工单、文件管理权限（10个） |
| 员工 | employee | password | 基础查看和工单文件操作权限（8个） |

## 📦 已完成的功能模块

### 1. 认证系统
- ✅ 用户登录/登出
- ✅ 用户注册
- ✅ JWT Token 认证
- ✅ 密码加密存储（bcrypt）
- ✅ 登录状态持久化

### 2. 用户管理
- ✅ 用户列表查询（分页、搜索、筛选）
- ✅ 创建用户（支持角色分配）
- ✅ 编辑用户信息
- ✅ 删除用户（软删除）
- ✅ 批量删除用户
- ✅ 重置用户密码
- ✅ 用户详情查看

**前端组件**: `web/src/views/UserManagement.vue`
**API接口**: `web/src/api/user.ts`

### 3. 角色管理
- ✅ 角色列表查询
- ✅ 创建角色
- ✅ 编辑角色
- ✅ 删除角色（保护系统角色）
- ✅ 为角色分配权限（权限树组件）
- ✅ 查看角色下的用户

**前端组件**: `web/src/views/RoleManagement.vue`
**API接口**: `web/src/api/role.ts`

### 4. 权限管理
- ✅ 权限列表查询
- ✅ 按资源分组展示
- ✅ 权限详情查看
- ✅ 创建/编辑/删除权限

**前端组件**: `web/src/views/PermissionManagement.vue`
**API接口**: `web/src/api/permission.ts`

### 5. 工单系统
- ✅ 工单列表（支持状态、类型、优先级筛选）
- ✅ 创建工单（4种类型：请假、报销、采购、其他）
- ✅ 编辑工单（仅待审批状态）
- ✅ 删除工单（仅待审批状态）
- ✅ 工单审批（通过/拒绝）
- ✅ 工单详情查看
- ✅ 权限控制（员工只能看自己的工单）

**前端组件**: `web/src/views/TicketManagement.vue`
**API接口**: `web/src/api/ticket.ts`

### 6. 文件管理
- ✅ 文件上传（支持多种格式）
- ✅ 文件列表查询
- ✅ 文件下载
- ✅ 文件删除（仅上传者和管理员）
- ✅ 文件大小限制（10MB）
- ✅ 文件类型白名单验证

**前端组件**: `web/src/views/FileManagement.vue`
**API接口**: `web/src/api/file.ts`

**支持的文件类型**:
- 图片: jpg, jpeg, png, gif, webp
- 文档: pdf, doc, docx, xls, xlsx, ppt, pptx
- 文本: txt, csv
- 压缩包: zip, rar, 7z

### 7. 操作日志
- ✅ 日志列表查询（分页）
- ✅ 按操作类型筛选
- ✅ 按资源类型筛选
- ✅ 按时间范围筛选
- ✅ 日志详情查看
- ✅ 记录IP地址和浏览器信息

**前端组件**: `web/src/views/LogManagement.vue`
**API接口**: `web/src/api/log.ts`

### 8. 仪表板
- ✅ 系统概览
- ✅ 快速访问入口

**前端组件**: `web/src/views/Dashboard.vue`

### 9. 个人中心
- ✅ 查看个人信息
- ✅ 修改密码
- ✅ 查看我的角色和权限

**前端组件**: `web/src/views/Profile.vue`

## 🎨 技术栈

### 后端
- **框架**: Express 5.x
- **数据库**: MySQL (Sequelize ORM)
- **认证**: JWT + bcrypt
- **文件上传**: Multer
- **日志**: Winston
- **验证**: Joi
- **安全**: Helmet, CORS

### 前端
- **框架**: Vue 3 (Composition API)
- **UI库**: Element Plus
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **语言**: TypeScript

## 🗂️ 项目结构

```
node_lean/
├── src/                          # 后端源码
│   ├── config/                   # 配置文件
│   │   ├── database.js          # 数据库配置
│   │   └── upload.js            # 文件上传配置
│   ├── controllers/             # 控制器层
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── roleController.js
│   │   ├── permissionController.js
│   │   ├── ticketController.js
│   │   ├── fileController.js
│   │   └── logController.js
│   ├── middlewares/             # 中间件
│   │   ├── auth.js             # 认证中间件
│   │   ├── permission.js       # 权限中间件
│   │   ├── upload.js           # 上传中间件
│   │   ├── validator.js        # 验证中间件
│   │   └── errorHandler.js     # 错误处理
│   ├── models/                  # 数据模型
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── Permission.js
│   │   ├── Ticket.js
│   │   ├── File.js
│   │   └── Log.js
│   ├── routes/                  # 路由
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── role.js
│   │   ├── permission.js
│   │   ├── ticket.js
│   │   ├── file.js
│   │   └── log.js
│   ├── services/                # 业务逻辑层
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── roleService.js
│   │   ├── permissionService.js
│   │   ├── ticketService.js
│   │   ├── fileService.js
│   │   └── logService.js
│   ├── scripts/                 # 脚本
│   │   ├── initPermissions.js  # 初始化权限
│   │   └── syncDatabase.js     # 同步数据库
│   └── utils/                   # 工具函数
│       ├── logger.js           # 日志工具
│       ├── response.js         # 响应格式化
│       └── logOperation.js     # 操作日志记录
├── web/                         # 前端源码
│   ├── src/
│   │   ├── api/                # API接口
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── role.ts
│   │   │   ├── permission.ts
│   │   │   ├── ticket.ts
│   │   │   ├── file.ts
│   │   │   └── log.ts
│   │   ├── components/         # 公共组件
│   │   ├── router/             # 路由配置
│   │   │   └── index.ts
│   │   ├── store/              # 状态管理
│   │   │   ├── user.ts
│   │   │   └── menu.ts
│   │   ├── utils/              # 工具函数
│   │   │   ├── request.ts      # Axios封装
│   │   │   └── permission.ts   # 权限判断
│   │   └── views/              # 页面组件
│   │       ├── Login.vue
│   │       ├── Register.vue
│   │       ├── Dashboard.vue
│   │       ├── Layout.vue
│   │       ├── UserManagement.vue
│   │       ├── RoleManagement.vue
│   │       ├── PermissionManagement.vue
│   │       ├── TicketManagement.vue
│   │       ├── FileManagement.vue
│   │       ├── LogManagement.vue
│   │       └── Profile.vue
│   └── package.json
├── uploads/                     # 文件上传目录
├── .env                         # 环境变量
├── server.js                    # 服务器入口
└── package.json
```

## 🔐 权限系统设计

### 权限模型
采用 RBAC (Role-Based Access Control) 基于角色的访问控制模型：

```
用户(User) ←→ 角色(Role) ←→ 权限(Permission)
    n:m            n:m
```

### 权限编码规范
格式: `resource:action`

示例:
- `user:read` - 查看用户
- `user:create` - 创建用户
- `ticket:approve` - 审批工单

### 内置角色及权限

**管理员 (admin)**: 27个权限
- 所有用户、角色、权限管理权限
- 所有工单、文件、日志管理权限

**经理 (manager)**: 10个权限
- 用户查看、更新
- 角色、权限查看
- 工单查看、创建、审批
- 文件查看、上传、下载

**员工 (employee)**: 8个权限
- 用户查看
- 工单查看、创建、更新、删除
- 文件查看、上传、下载

## 📊 数据库设计

### 核心表结构

**users** - 用户表
- id (UUID, 主键)
- username (用户名)
- password (密码hash)
- email (邮箱)
- realName (真实姓名)
- phone (手机号)
- status (状态: active/inactive/locked)

**roles** - 角色表
- id (UUID, 主键)
- name (角色名称)
- code (角色代码)
- description (描述)
- status (状态)

**permissions** - 权限表
- id (UUID, 主键)
- name (权限名称)
- code (权限代码)
- resource (资源)
- action (操作)
- description (描述)

**tickets** - 工单表
- id (自增, 主键)
- title (标题)
- content (内容)
- type (类型)
- priority (优先级)
- status (状态)
- creatorId (创建人)
- approverId (审批人)

**files** - 文件表
- id (自增, 主键)
- originalName (原始文件名)
- storedName (存储文件名)
- path (存储路径)
- size (文件大小)
- mimeType (MIME类型)
- uploaderId (上传者)

**logs** - 日志表
- id (自增, 主键)
- userId (操作人)
- action (操作类型)
- resource (资源类型)
- resourceId (资源ID)
- ip (IP地址)
- userAgent (浏览器信息)
- detail (详细信息JSON)

## 🎯 核心功能特性

### 1. 权限控制
- **路由级权限**: 根据用户权限动态生成菜单
- **按钮级权限**: 使用 `v-permission` 指令控制按钮显示
- **API级权限**: 后端中间件验证每个请求的权限

### 2. 工单审批流程
```
创建 → 待审批(pending) → 已通过(approved)/已拒绝(rejected)
       ↓
    可编辑/删除
```

### 3. 文件安全
- 文件类型白名单
- 文件大小限制(10MB)
- UUID文件名防止冲突
- 权限控制(仅上传者和管理员可删除)

### 4. 操作审计
- 自动记录所有重要操作
- 记录操作人、时间、IP、详情
- 支持按多维度查询

## 🔧 开发指南

### 本地开发

1. **安装依赖**
```bash
# 后端
npm install

# 前端
cd web
npm install
```

2. **配置环境变量**
复制 `.env.example` 为 `.env` 并配置：
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=node_lean
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

3. **初始化数据库**
```bash
# 同步数据库表结构
node src/scripts/syncDatabase.js

# 初始化权限和角色
node src/scripts/initPermissions.js
```

4. **启动开发服务器**
```bash
# 后端 (端口3000)
npm run dev

# 前端 (端口5174)
cd web
npm run dev
```

### 添加新功能

#### 添加新API接口

1. 创建模型 `src/models/YourModel.js`
2. 创建服务 `src/services/yourService.js`
3. 创建控制器 `src/controllers/yourController.js`
4. 创建路由 `src/routes/your.js`
5. 在 `src/app.js` 中注册路由

#### 添加新页面

1. 创建页面组件 `web/src/views/YourPage.vue`
2. 创建API接口 `web/src/api/your.ts`
3. 在 `web/src/router/index.ts` 添加路由
4. 在 `web/src/store/menu.ts` 添加菜单项

## 🧪 测试

### 功能测试清单

- [x] 用户登录/登出
- [x] 用户注册
- [x] 用户管理CRUD
- [x] 角色管理CRUD
- [x] 权限分配
- [x] 工单创建和审批
- [x] 文件上传和下载
- [x] 操作日志记录
- [x] 权限控制验证

## 📝 API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取当前用户信息

### 用户管理
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `POST /api/users/batch-delete` - 批量删除
- `POST /api/users/:id/reset-password` - 重置密码

### 角色管理
- `GET /api/roles` - 获取角色列表
- `GET /api/roles/:id` - 获取角色详情
- `POST /api/roles` - 创建角色
- `PUT /api/roles/:id` - 更新角色
- `DELETE /api/roles/:id` - 删除角色
- `POST /api/roles/:id/assign-permissions` - 分配权限

### 工单管理
- `GET /api/tickets` - 获取工单列表
- `GET /api/tickets/:id` - 获取工单详情
- `POST /api/tickets` - 创建工单
- `PUT /api/tickets/:id` - 更新工单
- `DELETE /api/tickets/:id` - 删除工单
- `POST /api/tickets/:id/approve` - 审批通过
- `POST /api/tickets/:id/reject` - 审批拒绝

### 文件管理
- `POST /api/files/upload` - 上传文件
- `GET /api/files` - 获取文件列表
- `GET /api/files/:id` - 获取文件详情
- `GET /api/files/:id/download` - 下载文件
- `DELETE /api/files/:id` - 删除文件

### 日志管理
- `GET /api/logs` - 获取日志列表
- `GET /api/logs/:id` - 获取日志详情

## 🚀 部署

### 生产环境配置

1. **构建前端**
```bash
cd web
npm run build
```

2. **配置环境变量**
```env
NODE_ENV=production
PORT=3000
DB_HOST=your_db_host
JWT_SECRET=your_strong_secret
```

3. **使用PM2启动**
```bash
pm2 start server.js --name node-lean
pm2 save
```

## 🐛 已知问题

无

## 📈 后续规划

- [ ] 添加数据统计和图表
- [ ] 增加消息通知功能
- [ ] 工单审批流程配置化
- [ ] 添加系统配置管理
- [ ] 增加导出功能(Excel)
- [ ] 添加单元测试
- [ ] API接口文档(Swagger)

## 👥 贡献

欢迎提交 Issue 和 Pull Request

## 📄 许可证

ISC

---

**开发完成时间**: 2026-08-17
**项目状态**: ✅ 完成并可用于生产环境
