#!/bin/bash

# Cloudflare Pages 部署脚本

echo "=== 部署到 Cloudflare Pages ==="
echo ""

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
  echo "❌ 请先登录 Cloudflare"
  echo "运行: wrangler login"
  exit 1
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi

# 部署到 Pages
echo "🚀 部署到 Cloudflare Pages..."
wrangler pages deploy .next --project-name=mcdonalds-workers

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 部署成功！"
  echo ""
  echo "📍 访问地址:"
  echo "   https://mcdonalds-workers.pages.dev"
else
  echo ""
  echo "❌ 部署失败"
  exit 1
fi
