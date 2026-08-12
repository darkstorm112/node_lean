@echo off
chcp 65001 >nul
echo =========================================
echo Node Lean Web 前端项目启动脚本
echo =========================================
echo.

REM 检查是否已安装依赖
if not exist "node_modules\" (
    echo 📦 正在安装依赖...
    call npm install
    echo.
)

echo 🚀 启动开发服务器...
echo.
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3000
echo.
call npm run dev
