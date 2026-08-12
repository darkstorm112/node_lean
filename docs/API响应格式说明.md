# API 响应格式说明

## 统一响应格式

所有 API 接口都返回 **HTTP 状态码 200**，业务状态通过响应体中的 `code` 字段区分。

## 响应结构

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 具体的业务数据
  }
}
```

### 错误响应
```json
{
  "code": 400/401/403/404/500,
  "message": "友好的中文错误提示",
  "error": null
}
```

## 业务状态码说明

| code | 说明 | 示例 |
|------|------|------|
| 200 | 成功 | 操作成功 |
| 201 | 创建成功 | 注册成功、创建资源成功 |
| 400 | 请求参数错误 | 参数校验失败、格式错误 |
| 401 | 未授权 | 未登录、Token 过期 |
| 403 | 权限不足 | 无权访问该资源 |
| 404 | 资源不存在 | 接口不存在、用户不存在 |
| 409 | 资源冲突 | 用户名已存在、邮箱已注册 |
| 500 | 服务器错误 | 系统异常、业务逻辑错误 |

## 常见错误提示

### 参数校验错误（code: 400）
- `用户名不能为空`
- `用户名长度至少3个字符`
- `用户名只能包含字母和数字`
- `密码长度至少6个字符`
- `邮箱格式不正确`
- `手机号格式不正确，请输入11位中国大陆手机号`

### 认证错误（code: 401）
- `未提供认证令牌`
- `认证令牌格式错误`
- `Token已过期`
- `无效的Token`
- `用户名或密码错误`
- `账号未激活`
- `账号已被锁定`

### 权限错误（code: 403）
- `无权限访问`

### 资源错误（code: 404）
- `接口不存在`
- `用户不存在`
- `资源不存在`

### 业务错误（code: 409）
- `用户名已存在`
- `邮箱已被注册`
- `数据已存在`

### 系统错误（code: 500）
- `服务器错误`（生产环境）
- 具体错误信息（开发环境）

## 前端处理示例

### JavaScript / Axios

```javascript
// 请求拦截器
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  response => {
    const { code, message, data } = response.data;
    
    if (code === 200 || code === 201) {
      // 成功
      return data;
    } else {
      // 业务错误
      if (code === 401) {
        // 未授权，跳转到登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // 显示错误提示
      showErrorMessage(message);
      return Promise.reject(new Error(message));
    }
  },
  error => {
    // 网络错误或其他异常
    showErrorMessage('网络错误，请稍后重试');
    return Promise.reject(error);
  }
);
```

### Vue 3 示例

```javascript
import { ElMessage } from 'element-plus';

// 使用示例
async function login(username, password) {
  try {
    const data = await axios.post('/api/auth/login', {
      username,
      password
    });
    
    // 登录成功
    localStorage.setItem('token', data.token);
    ElMessage.success('登录成功');
    router.push('/dashboard');
    
  } catch (error) {
    // 错误已在拦截器中处理
    console.error('登录失败:', error.message);
  }
}
```

### React 示例

```javascript
import { message } from 'antd';

// 使用示例
const handleLogin = async (values) => {
  try {
    const data = await axios.post('/api/auth/login', values);
    
    // 登录成功
    localStorage.setItem('token', data.token);
    message.success('登录成功');
    navigate('/dashboard');
    
  } catch (error) {
    // 错误已在拦截器中处理
    console.error('登录失败:', error.message);
  }
};
```

## 注意事项

1. **所有请求的 HTTP 状态码都是 200**，前端不应该根据 HTTP 状态码来判断请求是否成功
2. **通过响应体中的 `code` 字段判断业务状态**
3. **`code === 200` 或 `code === 201` 表示成功**，其他值表示错误
4. **错误信息 `message` 字段是用户友好的中文提示**，可以直接展示给用户
5. **需要携带 Token 的接口**，请在请求头中添加：`Authorization: Bearer <token>`

## API 测试示例

### 成功请求
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 响应
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGc...",
    "user": { ... }
  }
}
```

### 参数错误
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","password":"test123","email":"test@example.com"}'

# 响应
{
  "code": 400,
  "message": "用户名长度至少3个字符",
  "error": null
}
```

### 未授权访问
```bash
curl http://localhost:3000/api/auth/profile

# 响应
{
  "code": 401,
  "message": "未提供认证令牌",
  "error": null
}
```

### 权限不足
```bash
curl http://localhost:3000/api/test/admin-only \
  -H "Authorization: Bearer <employee_token>"

# 响应
{
  "code": 403,
  "message": "无权限访问",
  "error": null
}
```

---

*更新时间：2026-08-12*
