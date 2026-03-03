#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 提交麦当劳代下单项目到GitHub ==="
echo ""

# 检查git状态
echo "📊 Git状态:"
git status --short
echo ""

# 添加remote
if ! git remote | grep -q origin; then
  echo "📌 添加GitHub remote..."
  git remote add origin https://github.com/ceociocto/mcdonalds-workers.git
fi

echo ""
echo "🚀 推送到GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 成功！项目已上传到GitHub"
  echo "📍 仓库地址: https://github.com/ceociocto/mcdonalds-workers"
  echo ""
  echo "📦 项目内容:"
  git ls-files | head -20
else
  echo ""
  echo "❌ 推送失败，检查错误信息"
fi
