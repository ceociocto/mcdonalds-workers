/**
 * 订单管理路由
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createDb } from '../../lib/db';
import { orders, memberCards, stores, combos, cardUsageLogs } from '../../lib/schema';
import { eq, and, lt } from 'drizzle-orm';
import { successResponse, errorResponse, generateOrderId, generatePickupCode } from '../../lib/utils';

type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
};

const ordersRouter = new Hono<{ Bindings: Env }>();

const createOrderSchema = z.object({
  userId: z.string().min(1),
  storeId: z.string().min(1),
  comboId: z.string().min(1),
  notes: z.string().optional(),
});

// 创建订单（核心功能）
ordersRouter.post('/', zValidator('json', createOrderSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const db = createDb(c.env);

    // 1. 验证餐厅
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.storeId, data.storeId))
      .get();

    if (!store) {
      return errorResponse('餐厅不存在', 404);
    }

    // 2. 验证套餐
    const combo = await db
      .select()
      .from(combos)
      .where(eq(combos.comboId, data.comboId))
      .get();

    if (!combo) {
      return errorResponse('套餐不存在', 404);
    }

    if (!combo.isAvailable) {
      return errorResponse('套餐不可售', 400);
    }

    // 3. 匹配可用会员卡
    const card = await db
      .select()
      .from(memberCards)
      .where(
        and(
          eq(memberCards.status, 'active'),
          // balance >= combo.memberPrice (需要在查询时处理)
          lt(memberCards.usedToday, memberCards.dailyLimit)
        )
      )
      .orderBy(memberCards.usedToday)
      .get();

    if (!card) {
      return errorResponse('暂无可用会员卡', 400);
    }

    // 检查余额
    if (card.balance < combo.memberPrice) {
      return errorResponse('会员卡余额不足', 400);
    }

    // 4. 创建订单
    const orderId = generateOrderId();
    const pickupCode = generatePickupCode(data.storeId);
    const mcdOrderId = `MCD_${orderId}`;

    const newOrder = await db
      .insert(orders)
      .values({
        orderId,
        userId: data.userId,
        storeId: data.storeId,
        comboId: data.comboId,
        cardId: card.cardId,
        amount: combo.memberPrice,
        status: 'processing',
        pickupCode,
        mcdOrderId: mcdOrderId,
        items: combo.items,
        notes: data.notes,
        completedAt: new Date(),
      })
      .returning()
      .get();

    // 5. 更新会员卡
    const balanceBefore = card.balance;
    const balanceAfter = card.balance - combo.memberPrice;

    await db
      .update(memberCards)
      .set({
        balance: balanceAfter,
        usedToday: card.usedToday + 1,
      })
      .where(eq(memberCards.cardId, card.cardId));

    // 6. 记录使用日志
    await db.insert(cardUsageLogs).values({
      cardId: card.cardId,
      orderId,
      amount: combo.memberPrice,
      balanceBefore,
      balanceAfter,
    });

    // 7. 返回订单信息
    const result = {
      ...newOrder,
      storeName: store.name,
      comboName: combo.name,
      estimatedTime: 15,
    };

    return successResponse(result, '订单创建成功');
  } catch (error) {
    console.error('创建订单失败:', error);
    return errorResponse('创建订单失败', 500);
  }
});

// 获取所有订单
ordersRouter.get('/', async (c) => {
  try {
    const db = createDb(c.env);
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(orders.createdAt);

    return successResponse(allOrders);
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return errorResponse('获取订单列表失败', 500);
  }
});

// 获取订单详情
ordersRouter.get('/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const db = createDb(c.env);

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .get();

    if (!order) {
      return errorResponse('订单不存在', 404);
    }

    return successResponse(order);
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return errorResponse('获取订单详情失败', 500);
  }
});

// 获取用户订单
ordersRouter.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const db = createDb(c.env);

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);

    return successResponse(userOrders);
  } catch (error) {
    console.error('获取用户订单失败:', error);
    return errorResponse('获取用户订单失败', 500);
  }
});

export { ordersRouter };
