#!/bin/bash

# 初始化餐厅数据库脚本

echo "=== 初始化麦当劳餐厅数据库 ==="
echo ""

# 检查wrangler是否安装
if ! command -v wrangler &> /dev/null; then
  echo "❌ 请先安装 wrangler"
  echo "npm install -g wrangler"
  exit 1
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
  echo "❌ 请先登录 Cloudflare"
  echo "wrangler login"
  exit 1
fi

echo "1️⃣  创建餐厅表..."
wrangler d1 execute mcdonalds_db --remote --file=./drizzle/001_stores.sql

if [ $? -eq 0 ]; then
  echo "✅ 餐厅表创建成功"
else
  echo "❌ 餐厅表创建失败"
  exit 1
fi

echo ""
echo "2️⃣  插入餐厅数据..."
wrangler d1 execute mcdonalds_db --remote --file=./drizzle/002_stores_data.sql

if [ $? -eq 0 ]; then
  echo "✅ 餐厅数据插入成功"
else
  echo "❌ 餐厅数据插入失败"
  exit 1
fi

echo ""
echo "3️⃣  验证数据..."
wrangler d1 execute mcdonalds_db --remote --command="SELECT city, COUNT(*) as count FROM mcdonalds_stores GROUP BY city ORDER BY count DESC"

echo ""
echo "✅ 数据库初始化完成！"
echo ""
echo "📍 已添加城市和餐厅数量:"
wrangler d1 execute mcdonalds_db --remote --command="SELECT city, COUNT(*) as count FROM mcdonalds_stores GROUP BY city" 2>/dev/null | grep -E "上海|北京|广州|深圳|杭州|成都"

echo ""
echo "🚀 现在可以使用数据库查询API了:"
echo "   GET /api/stores/by-city?city=上海"
echo "   GET /api/stores/by-city?city=上海&keyword=人民广场"
