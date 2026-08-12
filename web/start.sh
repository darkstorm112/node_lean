#!/bin/bash

echo "========================================="
echo "Node Lean Web 前端项目启动脚本"
echo "========================================="
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    echo ""
fi

echo "🚀 启动开发服务器..."
echo ""
echo "前端地址: http://localhost:5173"
echo "后端地址: http://localhost:3000"
echo ""
npm run dev
