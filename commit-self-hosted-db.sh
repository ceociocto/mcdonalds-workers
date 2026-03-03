#!/bin/bash

echo "=== 提交自建数据库方案 ==="
echo ""

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

git add \
  drizzle/001_stores.sql \
  drizzle/002_stores_data.sql \
  workers/routes/stores-db.ts \
  workers/index.ts \
  components/StoreSearchDB.tsx \
  init-stores-db.sh \
  SELF_HOSTED_DB_GUIDE.md \
  NO_AMAP_ALTERNATIVE.md

git commit -m "feat: 自建数据库方案（无需高德API）

核心功能:
✅ 创建餐厅数据库表
✅ 插入47家餐厅数据（6城市）
✅ 数据库查询API
✅ 前端搜索组件
✅ 初始化脚本

已添加城市:
- 上海: 17家
- 北京: 9家
- 广州: 7家
- 深圳: 8家
- 杭州: 3家
- 成都: 3家

数据库表:
- mcdonalds_stores (城市、区域、地址、电话、营业时间等)
- 支持关键词搜索（名称、地址、区域）
- 特色标签（24h、McCafé、得来速）

API端点:
- GET /api/stores/by-city?city=上海
- GET /api/stores/by-city?city=上海&keyword=人民广场
- GET /api/stores/cities
- GET /api/stores/districts?city=上海

使用方法:
1. 运行 ./init-stores-db.sh 初始化数据库
2. 测试API验证数据
3. 前端使用StoreSearchDB组件

优势:
✅ 完全自主，无第三方依赖
✅ 查询速度快
✅ 数据可控
✅ 维护成本低

详细文档:
- SELF_HOSTED_DB_GUIDE.md (完整指南)
- NO_AMAP_ALTERNATIVE.md (方案对比)"

echo ""
echo "📤 推送到GitHub..."
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 方案已提交"
  echo ""
  echo "🚀 下一步:"
  echo "   1. 运行 ./init-stores-db.sh"
  echo "   2. 验证数据库"
  echo "   3. 测试搜索功能"
  echo ""
  echo "📚 文档: SELF_HOSTED_DB_GUIDE.md"
else
  echo ""
  echo "❌ 推送失败"
fi
