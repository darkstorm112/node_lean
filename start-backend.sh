#!/bin/bash

echo "========================================="
echo "Node Lean 后端服务启动脚本"
echo "========================================="
echo ""

echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
    echo ""
fi

echo ""
echo "🗄️  使用 SQLite 数据库"
echo "📂 数据库文件: database.sqlite"
echo ""
echo "🚀 启动后端服务..."
echo "📡 服务地址: http://localhost:3000"
echo ""
echo "默认管理员账号:"
echo "  用户名: admin"
echo "  密码: admin123"
echo ""
npm start
