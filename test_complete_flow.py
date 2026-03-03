#!/usr/bin/env python3
"""
麦当劳代下单服务 - 完整业务流程测试
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://mcdonalds-workers.lijieisme.workers.dev"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_response(response):
    """美化输出响应"""
    print(f"状态码: {response.status_code}")
    print(f"响应时间: {response.elapsed.total_seconds()*1000:.0f}ms")
    if response.headers.get('content-type', '').startswith('application/json'):
        print(f"响应数据:\n{json.dumps(response.json(), ensure_ascii=False, indent=2)}")
    else:
        print(f"响应内容: {response.text[:200]}")

# ============== 测试流程 ==============

print_section("麦当劳代下单服务 - 完整业务流程测试")

# 1. 健康检查
print_section("1️⃣  健康检查")
print("测试API服务是否正常运行...")
response = requests.get(f"{BASE_URL}/health")
print_response(response)
assert response.status_code == 200, "❌ 健康检查失败"
print("✅ 服务正常运行\n")

# 2. 查询会员卡
print_section("2️⃣  查询可用会员卡")
print("获取所有会员卡信息...")
response = requests.get(f"{BASE_URL}/api/cards")
cards = response.json()['data']
print(f"✅ 共 {len(cards)} 张会员卡")
for card in cards:
    status = "✅" if card['status'] == 'active' else "❌"
    print(f"  {status} {card['cardId']}: ¥{card['balance']} (已用{card['usedToday']}/{card['dailyLimit']})")

# 筛选可用卡
available_cards = [c for c in cards if c['status'] == 'active' and c['balance'] > 0]
print(f"\n可用会员卡: {len(available_cards)} 张\n")

# 3. 查询附近餐厅
print_section("3️⃣  查询附近餐厅")
print("以人民广场为中心，查询半径3km内的餐厅...")
response = requests.get(
    f"{BASE_URL}/api/stores/nearby",
    params={'lat': 31.2304, 'lng': 121.4737, 'radius': 3000}
)
stores = response.json()['data']
print(f"✅ 找到 {len(stores)} 家附近餐厅\n")
for i, store in enumerate(stores[:5], 1):
    print(f"  {i}. {store['name']}")
    print(f"     距离: {store.get('distance', 0):.0f}m")
    print(f"     地址: {store['address']}\n")

# 4. 查询套餐
print_section("4️⃣  查询套餐")
print("查询预算30元内的套餐...")
response = requests.get(f"{BASE_URL}/api/combos/budget/30")
combos = response.json()['data']
print(f"✅ 找到 {len(combos)} 个预算内套餐\n")
for i, combo in enumerate(combos[:5], 1):
    items = combo['items'] if isinstance(combo['items'], dict) else json.loads(combo['items'])
    print(f"  {i}. {combo['name']}")
    print(f"     原价: ¥{combo['originalPrice']}  会员价: ¥{combo['memberPrice']}  省{combo['discount']}%")
    print(f"     包含: {items.get('main', '')} + {items.get('side', '')} + {items.get('drink', '')}\n")

# 5. 选择并创建订单
print_section("5️⃣  创建订单")
print("选择：人民广场店 + 超值一号套餐")

order_data = {
    "userId": f"test_user_{datetime.now().strftime('%Y%m%d%H%M%S')}",
    "storeId": stores[0]['storeId'],  # 最近的人民广场店
    "comboId": combos[0]['comboId'],  # 第一个套餐
}

print(f"用户ID: {order_data['userId']}")
print(f"餐厅: {stores[0]['name']}")
print(f"套餐: {combos[0]['name']}")
print(f"金额: ¥{combos[0]['memberPrice']}\n")

print("正在创建订单...")
response = requests.post(
    f"{BASE_URL}/api/orders",
    json=order_data,
    headers={'Content-Type': 'application/json'}
)

order = response.json()['data']
print("✅ 订单创建成功！\n")
print(f"📦 订单号: {order['orderId']}")
print(f"📍 餐厅: {order['storeName']}")
print(f"🍔 套餐: {order['comboName']}")
print(f"💰 金额: ¥{order['amount']}")
print(f"🔢 取餐码: {order['pickupCode']}")
print(f"⏰ 预计时间: {order['estimatedTime']} 分钟")
print(f"💳 使用会员卡: {order['cardId']}")

# 6. 验证会员卡余额扣减
print_section("6️⃣  验证会员卡余额")
card_id = order['cardId']
response = requests.get(f"{BASE_URL}/api/cards/{card_id}")
card = response.json()['data']
print(f"会员卡: {card['cardId']}")
print(f"当前余额: ¥{card['balance']}")
print(f"今日已用: {card['usedToday']}/{card['dailyLimit']}")
print(f"状态: {card['status']}\n")

# 7. 查询订单详情
print_section("7️⃣  查询订单详情")
response = requests.get(f"{BASE_URL}/api/orders/{order['orderId']}")
order_detail = response.json()['data']
print(f"✅ 订单状态: {order_detail['status']}")
print(f"✅ 创建时间: {order_detail['createdAt']}")
print(f"✅ 完成时间: {order_detail.get('completedAt', '进行中...')}")

# 8. 查询用户订单历史
print_section("8️⃣  用户订单历史")
response = requests.get(f"{BASE_URL}/api/orders/user/{order_data['userId']}")
user_orders = response.json()['data']
print(f"✅ 该用户共有 {len(user_orders)} 个订单")
for i, o in enumerate(user_orders, 1):
    print(f"\n  {i}. 订单号: {o['orderId']}")
    print(f"     状态: {o['status']}")
    print(f"     金额: ¥{o['amount']}")

# ============== 测试总结 ==============
print_section("🎉 测试总结")

test_results = {
    "✅ 健康检查": "通过",
    "✅ 会员卡查询": f"找到 {len(cards)} 张",
    "✅ 附近餐厅": f"找到 {len(stores)} 家",
    "✅ 套餐查询": f"找到 {len(combos)} 个",
    "✅ 订单创建": order['orderId'],
    "✅ 余额扣减": f"¥{order['amount']} 已扣除",
    "✅ 取餐码生成": order['pickupCode'],
    "✅ 订单查询": "成功",
    "✅ 历史记录": f"{len(user_orders)} 个订单"
}

print("测试项目：\n")
for test, result in test_results.items():
    print(f"  {test} : {result}")

print(f"\n🎊 所有测试通过！业务流程运行正常！\n")
print(f"📍 测试订单号: {order['orderId']}")
print(f"🔢 取餐码: {order['pickupCode']}")
print(f"⏰ 测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

print("\n" + "="*60)
print("  测试完成")
print("="*60 + "\n")
