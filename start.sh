#!/bin/bash

# AI 互动影视游戏 - 启动脚本

echo "================================"
echo "🎬 AI 互动影视游戏"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装。请访问 https://nodejs.org/ 安装。"
    exit 1
fi

# 检查环境变量
if [ ! -f "backend/.env" ]; then
    echo "⚠️  后端 .env 文件不存在"
    echo "请复制 backend/.env.example 到 backend/.env 并配置 OPENAI_API_KEY"
    exit 1
fi

# 启动后端
echo "🚀 启动后端服务器..."
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
echo "✅ 后端启动中 (PID: $BACKEND_PID)"

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端应用..."
cd ../frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
echo "✅ 前端启动中 (PID: $FRONTEND_PID)"

echo ""
echo "================================"
echo "🎮 应用已启动！"
echo "================================"
echo "🌐 前端: http://localhost:3000"
echo "🔧 后端: http://localhost:3001"
echo "📚 API:  http://localhost:3001/api"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 监听 Ctrl+C 信号
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 等待进程
wait

