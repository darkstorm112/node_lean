-- Node Lean 项目数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS node_lean
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE node_lean;

-- 显示创建结果
SELECT 'Database node_lean created successfully!' AS message;
