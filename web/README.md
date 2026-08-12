# Node Lean Web 前端项目

基于 Vue 3 + TypeScript + Vite + Element Plus 构建的现代化前端应用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供类型支持
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由
- **Pinia** - Vue 状态管理库
- **Axios** - HTTP 客户端
- **Element Plus** - Vue 3 UI 组件库

## 项目结构

```
web/
├── public/              # 静态资源
├── src/
│   ├── api/            # API 接口
│   ├── assets/         # 资源文件
│   ├── components/     # 公共组件
│   ├── router/         # 路由配置
│   ├── store/          # 状态管理
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   └── style.css       # 全局样式
├── index.html          # HTML 模板
├── package.json        # 项目依赖
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
└── README.md           # 项目说明
```

## 功能特性

- ✅ 用户登录/注册
- ✅ JWT Token 认证
- ✅ 用户信息管理
- ✅ 密码修改
- ✅ 路由守卫
- ✅ 请求拦截器
- ✅ 响应拦截器
- ✅ 统一错误处理
- ✅ TypeScript 类型支持

## 开始使用

### 安装依赖

```bash
cd web
npm install
```

### 开发模式

```bash
npm run dev
```

应用将运行在 http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## API 配置

开发环境下，API 请求会通过 Vite 代理转发到后端服务器（默认 http://localhost:5000）。

如需修改后端地址，请编辑 [vite.config.ts](vite.config.ts#L13) 中的 proxy 配置：

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000', // 后端地址
      changeOrigin: true
    }
  }
}
```

## 默认账号

初始化数据后，可使用以下账号登录：

- 管理员：`admin` / `123456`
- 普通用户：`user` / `123456`

## 环境变量

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

## 浏览器支持

现代浏览器（Chrome、Firefox、Safari、Edge）的最新版本。

## License

MIT
