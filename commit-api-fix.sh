#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 提交API 404修复 ==="
echo ""

# 添加.env.local到.gitignore（不应该提交敏感信息）
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
  echo ".env.local" >> .gitignore
  echo "✅ 已将.env.local添加到.gitignore"
fi

# 提交其他文件
git add .gitignore API_404_FIX.md start-dev.sh

git commit -m "fix: 修复本地开发API 404错误

问题:
- Next.js开发服务器将/api/*识别为路由
- 导致API请求返回404

解决方案:
- 添加.env.local配置NEXT_PUBLIC_API_URL
- 指向Cloudflare Workers API
- 创建启动脚本
- 更新.gitignore

文件:
- .env.local (环境变量，不提交)
- .gitignore (忽略.env.local)
- API_404_FIX.md (修复文档)
- start-dev.sh (启动脚本)

使用方法:
1. 确保.env.local存在
2. 运行 npm run dev 或 ./start-dev.sh
3. 访问 http://localhost:3000"

echo ""
echo "📤 推送到GitHub..."
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 修复已提交"
  echo ""
  echo "🔧 使用方法:"
  echo "   npm run dev"
  echo "   或"
  echo "   ./start-dev.sh"
else
  echo ""
  echo "❌ 推送失败"
fi
