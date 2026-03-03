#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 构建Next.js项目 ==="
echo ""

echo "🔨 运行 npm run build..."
npm run build

echo ""
if [ $? -eq 0 ]; then
  echo "✅ 构建成功！"
  echo ""
  echo "📁 输出目录: .next"
  echo "📦 构建产物已准备好部署"
else
  echo "❌ 构建失败"
  exit 1
fi
