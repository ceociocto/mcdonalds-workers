#!/bin/bash

echo "=== 提交统一工程配置 ==="
echo ""

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

# 添加所有新文件
git add .github/workflows/deploy.yml
git add wrangler.toml
git add README.md
git add SECRETS_SETUP_GUIDE.md

# 提交
git commit -m "feat: 配置统一工程管理和自动部署

GitHub Actions:
- 添加自动部署workflow
- Workers和Pages自动部署
- push to main触发部署

配置文件:
- 更新wrangler.toml (添加pages_build_output_dir)
- 更新README (统一工程说明)
- 添加Secrets配置指南

工作流程:
1. 提交代码到main分支
2. 自动触发GitHub Actions
3. 部署Workers (后端API)
4. 构建Next.js
5. 部署Pages (前端)

需要配置的Secrets:
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID

配置指南: SECRETS_SETUP_GUIDE.md"

echo ""
echo "📤 推送到GitHub..."
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 代码已上传到GitHub"
  echo ""
  echo "🔧 下一步：配置GitHub Secrets"
  echo ""
  echo "1. 打开: https://github.com/ceociocto/mcdonalds-workers/settings/secrets/actions"
  echo "2. 添加 CLOUDFLARE_API_TOKEN"
  echo "3. 添加 CLOUDFLARE_ACCOUNT_ID"
  echo ""
  echo "详细指南: SECRETS_SETUP_GUIDE.md"
  echo ""
  echo "🚀 配置完成后，每次提交都会自动部署！"
else
  echo ""
  echo "❌ 推送失败"
  exit 1
fi
