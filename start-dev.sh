#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 启动Next.js开发服务器 ==="
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

echo "🚀 启动开发服务器..."
echo "📍 访问: http://localhost:3000"
echo "⚙️  API: https://mcdonalds-workers.lijieisme.workers.dev"
echo ""

npm run dev
