#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 提交前端代码到GitHub ==="
echo ""

git add components/ app/page.tsx app/layout.tsx app/globals.css FRONTEND_DEV_REPORT.md

if [ $? -eq 0 ]; then
  git commit -m "feat: 完成前端界面开发

组件:
- StoreSelector: 餐厅选择器（距离排序，半径筛选）
- ComboSelector: 套餐选择器（预算筛选，分类显示）
- OrderSummary: 订单摘要（卡匹配，详情展示）
- OrderSuccess: 成功页面（取餐码展示，一键复制）

功能:
- 完整下单流程（餐厅→套餐→确认→成功）
- 步骤指示器
- 智能会员卡匹配
- 响应式设计
- 流畅动画

技术栈:
- Next.js 15 + React 19
- TypeScript
- TailwindCSS
- Turbopack

本地开发: http://localhost:3000"

  echo ""
  echo "📤 推送到GitHub..."
  git push

  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 前端代码已上传到GitHub"
    echo "📍 查看: https://github.com/ceociocto/mcdonalds-workers"
    echo ""
    echo "🎨 本地预览: http://localhost:3000"
  else
    echo ""
    echo "❌ 推送失败"
  fi
else
  echo "❌ 没有文件需要提交"
fi
