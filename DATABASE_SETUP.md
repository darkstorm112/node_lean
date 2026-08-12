# MySQL 数据库配置指南

## 前置要求

确保已安装并启动 MySQL 服务。

## 步骤 1：创建数据库

### 方法 1：使用 SQL 脚本（推荐）

在 MySQL 客户端中执行 `init-database.sql` 文件：

```bash
mysql -u root -p < init-database.sql
```

或者登录 MySQL 后执行：

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS node_lean 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### 方法 2：使用 MySQL Workbench 或其他图形化工具

1. 连接到 MySQL 服务器
2. 创建新数据库：`node_lean`
3. 字符集选择：`utf8mb4`
4. 排序规则选择：`utf8mb4_unicode_ci`

## 步骤 2：配置数据库连接

编辑项目根目录的 `.env` 文件，修改数据库配置：

```env
# 数据库配置
DB_HOST=localhost          # 数据库主机地址
DB_PORT=3306              # 数据库端口
DB_NAME=node_lean         # 数据库名称
DB_USER=root              # 数据库用户名
DB_PASSWORD=your_password # 你的 MySQL 密码
```

**重要**：请将 `DB_PASSWORD` 改为你的 MySQL root 用户密码！

## 步骤 3：启动后端服务

```bash
npm start
```

服务启动时会自动：
- 测试数据库连接
- 同步数据库表结构（创建所有表）
- 初始化基础数据（角色、权限、管理员账号）

## 步骤 4：验证

启动成功后，你应该看到类似的日志输出：

```
数据库连接成功
数据库模型同步完成
角色初始化完成
权限初始化完成
角色权限关联初始化完成
默认管理员账号创建完成 (用户名: admin, 密码: admin123)
基础数据初始化完成！
服务已启动：http://localhost:3000
环境：development
```

## 默认管理员账号

- **用户名**: `admin`
- **密码**: `admin123`

## 常见问题

### 1. 连接失败 `Access denied for user 'root'@'localhost'`

请检查 `.env` 文件中的 `DB_PASSWORD` 是否正确。

### 2. 连接失败 `Unknown database 'node_lean'`

请先执行步骤 1 创建数据库。

### 3. MySQL 服务未启动

**Windows:**
```bash
net start MySQL
```

**Linux/Mac:**
```bash
sudo systemctl start mysql
# 或
sudo service mysql start
```

### 4. 修改 MySQL root 密码后无法连接

使用 MySQL 命令行修改密码：

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

然后更新 `.env` 文件中的 `DB_PASSWORD`。

## 数据库表结构

服务启动后会自动创建以下表：

- `Users` - 用户表
- `Roles` - 角色表
- `Permissions` - 权限表
- `RolePermissions` - 角色权限关联表
- `UserRoles` - 用户角色关联表

## 重置数据库

如果需要重置所有数据，可以删除数据库后重新创建：

```sql
DROP DATABASE node_lean;
CREATE DATABASE node_lean CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

然后重启服务，会自动重新初始化。
