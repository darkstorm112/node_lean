# API 接口文档

> 详细的 API 接口说明和示例

**基础信息**
- 基础路径：`http://localhost:3000/api`
- 认证方式：JWT Bearer Token
- 请求格式：`application/json`
- 响应格式：`application/json`

---

## 🔑 认证相关

### 1. 用户注册

**接口地址**：`POST /api/auth/register`

**请求参数**：
```json
{
  "username": "zhangsan",
  "password": "123456",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "realName": "张三"
}
```

**参数说明**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名，3-20字符，唯一 |
| password | string | 是 | 密码，6-20字符 |
| email | string | 是 | 邮箱，唯一 |
| phone | string | 否 | 手机号 |
| realName | string | 否 | 真实姓名 |

**成功响应**：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "createdAt": "2026-08-11T08:00:00.000Z"
  }
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "用户名已存在"
}
```

---

### 2. 用户登录

**接口地址**：`POST /api/auth/login`

**请求参数**：
```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "roles": ["employee"]
    }
  }
}
```

**错误响应**：
```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

---

### 3. 获取当前用户信息

**接口地址**：`GET /api/auth/profile`

**请求头**：
```
Authorization: Bearer <token>
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "realName": "张三",
    "avatar": null,
    "roles": [
      {
        "id": 2,
        "name": "普通员工",
        "code": "employee"
      }
    ],
    "permissions": [
      "ticket:create",
      "ticket:read:own"
    ]
  }
}
```

---

### 4. 更新当前用户信息

**接口地址**：`PUT /api/auth/profile`

**请求头**：
```
Authorization: Bearer <token>
```

**请求参数**：
```json
{
  "email": "newemail@example.com",
  "phone": "13900139000",
  "realName": "张三丰",
  "avatar": "https://example.com/avatar.jpg"
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "email": "newemail@example.com",
    "phone": "13900139000",
    "realName": "张三丰",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

---

### 5. 修改密码

**接口地址**：`POST /api/auth/change-password`

**请求头**：
```
Authorization: Bearer <token>
```

**请求参数**：
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "密码修改成功"
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "原密码错误"
}
```

---

## 👥 用户管理（管理员）

### 1. 获取用户列表

**接口地址**：`GET /api/users`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`user:read`

**查询参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 搜索关键词（用户名/邮箱） |
| status | string | 否 | 状态筛选：active/inactive |

**请求示例**：
```
GET /api/users?page=1&pageSize=10&keyword=zhang
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "username": "zhangsan",
        "email": "zhangsan@example.com",
        "realName": "张三",
        "status": "active",
        "roles": ["employee"],
        "createdAt": "2026-08-11T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 2. 获取用户详情

**接口地址**：`GET /api/users/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`user:read`

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "realName": "张三",
    "avatar": null,
    "status": "active",
    "lastLoginAt": "2026-08-11T08:00:00.000Z",
    "roles": [
      {
        "id": 2,
        "name": "普通员工",
        "code": "employee"
      }
    ],
    "createdAt": "2026-08-11T08:00:00.000Z",
    "updatedAt": "2026-08-11T08:00:00.000Z"
  }
}
```

---

### 3. 创建用户

**接口地址**：`POST /api/users`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`user:create`

**请求参数**：
```json
{
  "username": "lisi",
  "password": "123456",
  "email": "lisi@example.com",
  "phone": "13900139000",
  "realName": "李四",
  "roleIds": [2]
}
```

**成功响应**：
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 2,
    "username": "lisi",
    "email": "lisi@example.com"
  }
}
```

---

### 4. 更新用户

**接口地址**：`PUT /api/users/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`user:update`

**请求参数**：
```json
{
  "email": "newemail@example.com",
  "phone": "13900139000",
  "realName": "李四丰",
  "status": "inactive"
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 2,
    "username": "lisi",
    "email": "newemail@example.com"
  }
}
```

---

### 5. 删除用户

**接口地址**：`DELETE /api/users/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`user:delete`

**成功响应**：
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 6. 分配角色

**接口地址**：`POST /api/users/:id/roles`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`user:update`

**请求参数**：
```json
{
  "roleIds": [1, 2]
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "角色分配成功"
}
```

---

## 🎫 工单管理

### 1. 创建工单

**接口地址**：`POST /api/tickets`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`ticket:create`

**请求参数**：
```json
{
  "title": "申请购买办公用品",
  "content": "需要购买10支签字笔和5个笔记本",
  "type": "purchase",
  "priority": "medium",
  "fileIds": [1, 2]
}
```

**参数说明**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 工单标题 |
| content | string | 是 | 工单内容 |
| type | string | 是 | 工单类型：purchase/leave/reimbursement 等 |
| priority | string | 否 | 优先级：low/medium/high，默认 medium |
| fileIds | array | 否 | 附件文件 ID 数组 |

**成功响应**：
```json
{
  "code": 201,
  "message": "工单创建成功",
  "data": {
    "id": 1,
    "title": "申请购买办公用品",
    "status": "pending",
    "creator": {
      "id": 1,
      "username": "zhangsan",
      "realName": "张三"
    },
    "createdAt": "2026-08-11T08:00:00.000Z"
  }
}
```

---

### 2. 获取工单列表

**接口地址**：`GET /api/tickets`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`ticket:read:own` 或 `ticket:read:all`

**查询参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| status | string | 否 | 状态筛选：pending/approved/rejected |
| type | string | 否 | 类型筛选 |
| priority | string | 否 | 优先级筛选 |

**请求示例**：
```
GET /api/tickets?page=1&pageSize=10&status=pending
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "申请购买办公用品",
        "type": "purchase",
        "priority": "medium",
        "status": "pending",
        "creator": {
          "id": 1,
          "username": "zhangsan",
          "realName": "张三"
        },
        "createdAt": "2026-08-11T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**权限说明**：
- `ticket:read:own`：只能看到自己创建的工单
- `ticket:read:all`：可以看到所有工单

---

### 3. 获取工单详情

**接口地址**：`GET /api/tickets/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "申请购买办公用品",
    "content": "需要购买10支签字笔和5个笔记本",
    "type": "purchase",
    "priority": "medium",
    "status": "pending",
    "creator": {
      "id": 1,
      "username": "zhangsan",
      "realName": "张三"
    },
    "approver": null,
    "approvedAt": null,
    "rejectReason": null,
    "files": [
      {
        "id": 1,
        "originalName": "清单.xlsx",
        "size": 12345,
        "url": "/api/files/1/download"
      }
    ],
    "createdAt": "2026-08-11T08:00:00.000Z",
    "updatedAt": "2026-08-11T08:00:00.000Z"
  }
}
```

---

### 4. 更新工单

**接口地址**：`PUT /api/tickets/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**限制**：只能更新自己创建的、状态为 pending 的工单

**请求参数**：
```json
{
  "title": "修改后的标题",
  "content": "修改后的内容",
  "priority": "high"
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "title": "修改后的标题",
    "updatedAt": "2026-08-11T09:00:00.000Z"
  }
}
```

---

### 5. 审批通过工单

**接口地址**：`POST /api/tickets/:id/approve`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`ticket:approve`

**成功响应**：
```json
{
  "code": 200,
  "message": "审批通过",
  "data": {
    "id": 1,
    "status": "approved",
    "approver": {
      "id": 2,
      "username": "manager",
      "realName": "王经理"
    },
    "approvedAt": "2026-08-11T10:00:00.000Z"
  }
}
```

---

### 6. 审批拒绝工单

**接口地址**：`POST /api/tickets/:id/reject`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`ticket:approve`

**请求参数**：
```json
{
  "reason": "预算不足，暂不批准"
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "审批拒绝",
  "data": {
    "id": 1,
    "status": "rejected",
    "approver": {
      "id": 2,
      "username": "manager",
      "realName": "王经理"
    },
    "rejectReason": "预算不足，暂不批准",
    "approvedAt": "2026-08-11T10:00:00.000Z"
  }
}
```

---

### 7. 删除工单

**接口地址**：`DELETE /api/tickets/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**限制**：只能删除自己创建的、状态为 pending 的工单

**成功响应**：
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 📁 文件管理

### 1. 上传文件

**接口地址**：`POST /api/files/upload`

**请求头**：
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数**：
- `file`: 文件（form-data）
- `relatedType`: 关联类型（可选，如 "ticket"）
- `relatedId`: 关联 ID（可选）

**限制**：
- 单个文件最大 10MB
- 支持类型：图片、文档、压缩包等

**成功响应**：
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "id": 1,
    "originalName": "文档.pdf",
    "size": 123456,
    "mimeType": "application/pdf",
    "url": "/api/files/1/download",
    "uploadedAt": "2026-08-11T08:00:00.000Z"
  }
}
```

---

### 2. 下载文件

**接口地址**：`GET /api/files/:id/download`

**请求头**：
```
Authorization: Bearer <token>
```

**成功响应**：
- 直接返回文件流
- 响应头包含文件名：`Content-Disposition: attachment; filename="xxx"`

---

### 3. 获取文件列表

**接口地址**：`GET /api/files`

**请求头**：
```
Authorization: Bearer <token>
```

**查询参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| relatedType | string | 否 | 关联类型筛选 |
| relatedId | number | 否 | 关联 ID 筛选 |

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "originalName": "文档.pdf",
        "size": 123456,
        "mimeType": "application/pdf",
        "uploader": {
          "id": 1,
          "username": "zhangsan"
        },
        "createdAt": "2026-08-11T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 4. 删除文件

**接口地址**：`DELETE /api/files/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：只能删除自己上传的文件，或拥有 `file:delete` 权限

**成功响应**：
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 🛡️ 角色管理（管理员）

### 1. 获取角色列表

**接口地址**：`GET /api/roles`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`role:read`

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "系统管理员",
      "code": "admin",
      "description": "拥有所有权限",
      "createdAt": "2026-08-11T08:00:00.000Z"
    },
    {
      "id": 2,
      "name": "普通员工",
      "code": "employee",
      "description": "基础权限",
      "createdAt": "2026-08-11T08:00:00.000Z"
    }
  ]
}
```

---

### 2. 获取角色详情

**接口地址**：`GET /api/roles/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`role:read`

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 2,
    "name": "普通员工",
    "code": "employee",
    "description": "基础权限",
    "permissions": [
      {
        "id": 10,
        "name": "创建工单",
        "code": "ticket:create"
      },
      {
        "id": 11,
        "name": "查看自己的工单",
        "code": "ticket:read:own"
      }
    ],
    "createdAt": "2026-08-11T08:00:00.000Z"
  }
}
```

---

### 3. 创建角色

**接口地址**：`POST /api/roles`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`role:create`

**请求参数**：
```json
{
  "name": "部门经理",
  "code": "dept_manager",
  "description": "部门管理权限"
}
```

**成功响应**：
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 3,
    "name": "部门经理",
    "code": "dept_manager"
  }
}
```

---

### 4. 更新角色

**接口地址**：`PUT /api/roles/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`role:update`

**请求参数**：
```json
{
  "name": "高级经理",
  "description": "高级管理权限"
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "更新成功"
}
```

---

### 5. 删除角色

**接口地址**：`DELETE /api/roles/:id`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`role:delete`

**成功响应**：
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 6. 分配权限

**接口地址**：`POST /api/roles/:id/permissions`

**请求头**：
```
Authorization: Bearer <token>
```

**权限要求**：`role:update`

**请求参数**：
```json
{
  "permissionIds": [10, 11, 12]
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "权限分配成功"
}
```

---

## 📊 通用说明

### 统一错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 删除成功 |
| 400 | 参数错误 |
| 401 | 未认证（Token 无效或过期） |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如用户名重复） |
| 500 | 服务器错误 |

### Token 使用方式

所有需要认证的接口都需要在请求头中携带 Token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 分页说明

所有列表接口都支持分页，查询参数：
- `page`：页码，从 1 开始
- `pageSize`：每页数量，默认 10，最大 100

返回格式：
```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🧪 测试示例

### 完整流程示例（Postman/cURL）

#### 1. 注册用户
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456",
    "email": "test@example.com"
  }'
```

#### 2. 登录获取 Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456"
  }'
```

#### 3. 使用 Token 访问受保护接口
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <你的token>"
```

#### 4. 创建工单
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer <你的token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试工单",
    "content": "这是一个测试工单",
    "type": "test",
    "priority": "medium"
  }'
```

---

*文档持续更新中...*
