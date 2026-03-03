#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 生成数据库迁移文件 ==="
npx drizzle-kit generate

echo ""
echo "=== 创建本地D1数据库 ==="
wrangler d1 create mcdonalds_db --local

echo ""
echo "=== 执行本地迁移 ==="
wrangler d1 execute mcdonalds_db --local --file=./drizzle/0000_init.sql

echo ""
echo "✅ 数据库初始化完成！"
