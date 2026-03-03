#!/bin/bash

echo "=== 提交城市选择+搜索方案 ==="
echo ""

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

git add \
  lib/store-service-v2.ts \
  components/CitySelector.tsx \
  components/StoreSearch.tsx \
  app/page-v2.tsx \
  workers/routes/stores-search.ts \
  workers/index.ts \
  wrangler.toml \
  CITY_SEARCH_SOLUTION.md

git commit -m "feat: 城市选择+搜索方案

新方案特点:
✅ 无需定位权限
✅ 用户选择城市
✅ 关键词搜索餐厅
✅ 简单易用

新增组件:
- CitySelector: 热门城市+省份选择
- StoreSearch: 关键词搜索餐厅列表
- page-v2: 新版主页面（4步流程）

新增服务:
- store-service-v2: 城市数据+搜索API
- stores-search路由: Workers API路由

支持功能:
- 12个省份50+城市
- 热门城市快速选择
- 关键词搜索（商圈、地标、路名）
- 搜索结果距离排序
- 推荐标签

数据来源: 高德地图POI API
免费额度: 30万次/天

使用方法:
1. 获取高德API Key
2. 配置AMAP_API_KEY
3. 选择城市
4. 搜索餐厅
5. 下单

详细文档: CITY_SEARCH_SOLUTION.md"

echo ""
echo "📤 推送到GitHub..."
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 方案已提交"
  echo ""
  echo "📚 文档: CITY_SEARCH_SOLUTION.md"
  echo ""
  echo "🚀 下一步:"
  echo "   1. 获取高德API Key"
  echo "   2. 配置环境变量"
  echo "   3. 测试搜索功能"
else
  echo ""
  echo "❌ 推送失败"
fi
