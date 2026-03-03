#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 提交测试数据报告到GitHub ==="
echo ""

git add TEST_DATA_REPORT.md
git commit -m "test: 添加测试数据报告

- 插入5张会员卡
- 插入20家上海麦当劳
- 插入10个热门套餐
- 验证所有API功能
- 测试智能匹配算法
- 验证余额扣减逻辑

数据已在D1数据库中正常使用。"

echo ""
echo "📤 推送到GitHub..."
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 测试数据报告已上传到GitHub"
  echo "📍 查看: https://github.com/ceociocto/mcdonalds-workers"
else
  echo ""
  echo "❌ 推送失败"
fi
