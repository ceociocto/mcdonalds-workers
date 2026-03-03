#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 部署到 Cloudflare Pages ==="
echo ""

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
  echo "❌ 请先登录 Cloudflare"
  echo "运行: wrangler login"
  exit 1
fi

# 检查out目录
if [ ! -d "out" ]; then
  echo "❌ 找不到out目录，请先运行构建"
  exit 1
fi

# 部署到 Pages
echo "🚀 部署到 Cloudflare Pages..."
echo "📁 部署目录: out"
echo ""

wrangler pages deploy out --project-name=mcdonalds-workers --commit-dirty=true --commit-message="Deploy McDonald's ordering frontend"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 部署成功！"
  echo ""
  echo "📍 访问地址:"
  echo "   https://mcdonalds-workers.pages.dev"
  echo ""
  echo "⚠️  注意: 需要配置API代理以访问Workers后端"
else
  echo ""
  echo "❌ 部署失败"
  exit 1
fi
