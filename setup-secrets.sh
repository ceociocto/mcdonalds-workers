#!/bin/bash

# 快速配置GitHub Secrets

echo "=== 快速配置GitHub Secrets ==="
echo ""

# 检查wrangler是否安装
if ! command -v wrangler &> /dev/null; then
  echo "❌ 请先安装 wrangler"
  echo "npm install -g wrangler"
  exit 1
fi

# 检查是否已登录
echo "1️⃣  检查Cloudflare登录状态..."
if wrangler whoami &> /dev/null; then
  echo "✅ 已登录Cloudflare"
  echo ""
  echo "📍 获取Account ID..."
  ACCOUNT_ID=$(wrangler whoami 2>/dev/null | grep "Account ID:" | awk '{print $3}')
  if [ -n "$ACCOUNT_ID" ]; then
    echo "✅ Account ID: $ACCOUNT_ID"
    echo ""
    echo "📋 复制这个Account ID到GitHub Secrets:"
    echo "   Name: CLOUDFLARE_ACCOUNT_ID"
    echo "   Value: $ACCOUNT_ID"
    echo ""
  fi
else
  echo "❌ 未登录Cloudflare"
  echo ""
  echo "请运行: wrangler login"
  echo "然后在浏览器中授权"
  exit 1
fi

echo "2️⃣  获取API Token..."
echo ""
echo "📖 按照以下步骤获取Token:"
echo ""
echo "1. 访问: https://dash.cloudflare.com/profile/api-tokens"
echo "2. 点击 'Create Token'"
echo "3. 选择 'Edit Cloudflare Workers' 模板"
echo "4. 或创建自定义Token，包含以下权限:"
echo "   - Account - Cloudflare Workers - Edit"
echo "   - Account - Account Settings - Read"
echo "5. 点击 'Continue to summary' → 'Create Token'"
echo "6. 复制Token（只显示一次！）"
echo ""

echo "3️⃣  添加到GitHub Secrets..."
echo ""
echo "访问: https://github.com/ceociocto/mcdonalds-workers/settings/secrets/actions"
echo ""
echo "添加两个Secrets:"
echo ""
echo "Secret 1:"
echo "  Name: CLOUDFLARE_API_TOKEN"
echo "  Value: [粘贴步骤2获取的Token]"
echo ""
echo "Secret 2:"
echo "  Name: CLOUDFLARE_ACCOUNT_ID"
echo "  Value: $ACCOUNT_ID"
echo ""

echo "4️⃣  测试自动部署..."
echo ""
echo "配置完成后，运行以下命令测试:"
echo ""
echo "  git commit --allow-empty -m \"test: 触发自动部署\""
echo "  git push"
echo ""
echo "然后查看部署状态:"
echo "  https://github.com/ceociocto/mcdonalds-workers/actions"
echo ""

echo "✅ 配置完成！"
echo ""
echo "详细指南: SECRETS_SETUP_GUIDE.md"
