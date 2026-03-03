#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 提交部署代码到GitHub ==="
echo ""

git add lib/config.ts next.config.ts components/ app/page.tsx build.sh deploy-to-pages.sh DEPLOYMENT_SUCCESS_REPORT.md

if [ $? -eq 0 ]; then
  git commit -m "feat: 部署到Cloudflare Pages生产环境

前端:
- 配置静态导出 (output: export)
- 添加API配置 (lib/config.ts)
- 更新所有组件API调用
- 修复TypeScript类型错误

后端:
- Workers已部署 (https://mcdonalds-workers.lijieisme.workers.dev)
- D1数据库已配置
- 测试数据已添加

部署:
- 前端: https://mcdonalds-workers.pages.dev
- 后端: https://mcdonalds-workers.lijieisme.workers.dev
- 状态: 生产就绪

技术栈:
- Next.js 15 (静态导出)
- React 19 (客户端组件)
- Cloudflare Pages (前端托管)
- Cloudflare Workers (API后端)
- Cloudflare D1 (数据库)"

  echo ""
  echo "📤 推送到GitHub..."
  git push

  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码已上传到GitHub"
    echo "📍 查看: https://github.com/ceociocto/mcdonalds-workers"
    echo ""
    echo "🌐 生产环境:"
    echo "   前端: https://mcdonalds-workers.pages.dev"
    echo "   后端: https://mcdonalds-workers.lijieisme.workers.dev"
  else
    echo ""
    echo "❌ 推送失败"
  fi
else
  echo "❌ 没有文件需要提交"
fi
