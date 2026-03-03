/**
 * 套餐管理路由
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createDb } from '../../lib/db';
import { combos } from '../../lib/schema';
import { eq, and, lte } from 'drizzle-orm';
import { successResponse, errorResponse } from '../../lib/utils';

type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
};

const combosRouter = new Hono<{ Bindings: Env }>();

const createComboSchema = z.object({
  comboId: z.string().min(1),
  name: z.string().min(1),
  originalPrice: z.number().positive(),
  memberPrice: z.number().positive(),
  items: z.string(), // JSON字符串
  category: z.string().optional(),
});

// 添加套餐
combosRouter.post('/', zValidator('json', createComboSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const db = createDb(c.env);

    const existing = await db
      .select()
      .from(combos)
      .where(eq(combos.comboId, data.comboId))
      .get();

    if (existing) {
      return errorResponse('套餐ID已存在', 400);
    }

    const newCombo = await db
      .insert(combos)
      .values({
        ...data,
        items: JSON.stringify(data.items),
      })
      .returning()
      .get();

    return successResponse(newCombo, '套餐添加成功');
  } catch (error) {
    console.error('添加套餐失败:', error);
    return errorResponse('添加套餐失败', 500);
  }
});

// 获取所有套餐
combosRouter.get('/', async (c) => {
  try {
    const db = createDb(c.env);
    const allCombos = await db
      .select()
      .from(combos)
      .where(eq(combos.isAvailable, 1))
      .orderBy(combos.createdAt);

    const result = allCombos.map(combo => ({
      ...combo,
      items: JSON.parse(combo.items),
      discount: ((1 - combo.memberPrice / combo.originalPrice) * 100).toFixed(1),
    }));

    return successResponse(result);
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    return errorResponse('获取套餐列表失败', 500);
  }
});

// 获取预算内套餐
combosRouter.get('/budget/:budget', async (c) => {
  try {
    const budget = parseFloat(c.req.param('budget'));
    const db = createDb(c.env);

    const affordableCombos = await db
      .select()
      .from(combos)
      .where(
        and(
          eq(combos.isAvailable, 1),
          lte(combos.memberPrice, budget)
        )
      )
      .orderBy(combos.createdAt);

    const result = affordableCombos.map(combo => ({
      ...combo,
      items: JSON.parse(combo.items),
      discount: ((1 - combo.memberPrice / combo.originalPrice) * 100).toFixed(1),
    }));

    return successResponse(result);
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    return errorResponse('获取套餐列表失败', 500);
  }
});

export { combosRouter };
