#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 提交真实API对接方案 ==="
echo ""

git add lib/store-service.ts \
        components/StoreSelectorEnhanced.tsx \
        REAL_MCDONALDS_API_PLAN.md \
        FRONTEND_STATUS_AND_PLAN.md

git commit -m "feat: 添加真实API对接方案

新增文件:
1. lib/store-service.ts
   - 高德地图API集成
   - 自动定位功能
   - 智能餐厅推荐
   - 距离计算

2. components/StoreSelectorEnhanced.tsx
   - 增强版餐厅选择器
   - 支持自动定位
   - 支持半径筛选
   - 智能排序

3. REAL_MCDONALDS_API_PLAN.md
   - 完整技术方案
   - API对接细节
   - 会员卡集成
   - 风险评估

4. FRONTEND_STATUS_AND_PLAN.md
   - 前端开发状态
   - 三大问题解答
   - 实施计划
   - 快速升级指南

核心功能:
- 获取真实麦当劳餐厅（高德地图）
- 自动定位用户位置
- 智能推荐附近餐厅
- 支持半径筛选
- 距离计算和排序

使用方法:
1. 注册高德开放平台获取API Key
2. 配置NEXT_PUBLIC_AMAP_API_KEY
3. 设置NEXT_PUBLIC_USE_AMAP=true
4. 重启开发服务器

快速实施: 30分钟
完整实施: 2-4周（对接真实麦当劳API）"

echo ""
echo "📤 推送到GitHub..."
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 方案已提交"
  echo ""
  echo "📚 文档:"
  echo "   - REAL_MCDONALDS_API_PLAN.md (技术方案)"
  echo "   - FRONTEND_STATUS_AND_PLAN.md (状态总结)"
  echo ""
  echo "🚀 下一步:"
  echo "   选择快速升级(30分钟)或完整实施(2-4周)"
else
  echo ""
  echo "❌ 推送失败"
fi
