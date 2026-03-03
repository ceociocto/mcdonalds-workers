#!/bin/bash

cd /Volumes/sn7100/jerry/.openclaw/workspace/mcdonalds-workers

echo "=== 提交测试报告到GitHub ==="
echo ""

git add test_complete_flow.py COMPLETE_FLOW_TEST_REPORT.md
git commit -m "test: 添加完整业务流程测试

- 创建自动化测试脚本
- 测试所有API端点
- 验证智能会员卡匹配
- 验证余额扣减逻辑
- 验证订单状态追踪
- 生成详细测试报告

所有测试通过，系统运行正常！"

echo ""
echo "📤 推送到GitHub..."
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 测试报告已上传到GitHub"
  echo "📍 查看: https://github.com/ceociocto/mcdonalds-workers"
else
  echo ""
  echo "❌ 推送失败"
fi
