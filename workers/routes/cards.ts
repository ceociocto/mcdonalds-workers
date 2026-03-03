/**
 * 会员卡管理路由
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createDb } from '../../lib/db';
import { memberCards, cardUsageLogs } from '../../lib/schema';
import { eq, and, lt } from 'drizzle-orm';
import { successResponse, errorResponse } from '../../lib/utils';

type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
};

const cards = new Hono<{ Bindings: Env }>();

// ============== 验证Schema ==============

const createCardSchema = z.object({
  cardId: z.string().min(1),
  phone: z.string().min(1),
  password: z.string().optional(),
  balance: z.number().default(0),
  dailyLimit: z.number().default(5),
  notes: z.string().optional(),
});

// ============== 路由定义 ==============

// 添加会员卡
cards.post('/', zValidator('json', createCardSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const db = createDb(c.env);

    // 检查卡号是否已存在
    const existing = await db
      .select()
      .from(memberCards)
      .where(eq(memberCards.cardId, data.cardId))
      .get();

    if (existing) {
      return errorResponse('卡号已存在', 400);
    }

    // 创建新卡
    const newCard = await db
      .insert(memberCards)
      .values({
        cardId: data.cardId,
        phone: data.phone,
        password: data.password,
        balance: data.balance,
        dailyLimit: data.dailyLimit,
        notes: data.notes,
      })
      .returning()
      .get();

    return successResponse(newCard, '会员卡添加成功');
  } catch (error) {
    console.error('添加会员卡失败:', error);
    return errorResponse('添加会员卡失败', 500);
  }
});

// 获取所有会员卡
cards.get('/', async (c) => {
  try {
    const db = createDb(c.env);
    const cards = await db.select().from(memberCards).orderBy(memberCards.createdAt);
    return successResponse(cards);
  } catch (error) {
    console.error('获取会员卡列表失败:', error);
    return errorResponse('获取会员卡列表失败', 500);
  }
});

// 获取可用会员卡
cards.get('/available/:amount', async (c) => {
  try {
    const amount = parseFloat(c.req.param('amount'));
    const db = createDb(c.env);

    // 筛选条件：状态活跃、余额充足、未超限
    const cards = await db
      .select()
      .from(memberCards)
      .where(
        and(
          eq(memberCards.status, 'active'),
          eq(memberCards.balance, amount), // balance >= amount
          lt(memberCards.usedToday, memberCards.dailyLimit)
        )
      )
      .orderBy(memberCards.usedToday);

    return successResponse(cards);
  } catch (error) {
    console.error('获取可用会员卡失败:', error);
    return errorResponse('获取可用会员卡失败', 500);
  }
});

// 获取单个会员卡
cards.get('/:cardId', async (c) => {
  try {
    const cardId = c.req.param('cardId');
    const db = createDb(c.env);

    const card = await db
      .select()
      .from(memberCards)
      .where(eq(memberCards.cardId, cardId))
      .get();

    if (!card) {
      return errorResponse('会员卡不存在', 404);
    }

    return successResponse(card);
  } catch (error) {
    console.error('获取会员卡详情失败:', error);
    return errorResponse('获取会员卡详情失败', 500);
  }
});

// 删除会员卡
cards.delete('/:cardId', async (c) => {
  try {
    const cardId = c.req.param('cardId');
    const db = createDb(c.env);

    await db.delete(memberCards).where(eq(memberCards.cardId, cardId));

    return successResponse({ cardId }, '会员卡删除成功');
  } catch (error) {
    console.error('删除会员卡失败:', error);
    return errorResponse('删除会员卡失败', 500);
  }
});

// 重置每日限额
cards.post('/:cardId/reset', async (c) => {
  try {
    const cardId = c.req.param('cardId');
    const db = createDb(c.env);

    await db
      .update(memberCards)
      .set({ usedToday: 0 })
      .where(eq(memberCards.cardId, cardId));

    return successResponse({ cardId, usedToday: 0 }, '重置成功');
  } catch (error) {
    console.error('重置会员卡失败:', error);
    return errorResponse('重置会员卡失败', 500);
  }
});

export { cards as cardsRouter };
