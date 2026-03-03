/**
 * 餐厅管理路由
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createDb } from '../../lib/db';
import { stores } from '../../lib/schema';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse, calculateDistance } from '../../lib/utils';

type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
};

const storesRouter = new Hono<{ Bindings: Env }>();

// 创建Schema
const createStoreSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().min(1),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  businessHours: z.string().optional(),
  phone: z.string().optional(),
});

// 添加餐厅
storesRouter.post('/', zValidator('json', createStoreSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const db = createDb(c.env);

    const existing = await db
      .select()
      .from(stores)
      .where(eq(stores.storeId, data.storeId))
      .get();

    if (existing) {
      return errorResponse('餐厅ID已存在', 400);
    }

    const newStore = await db
      .insert(stores)
      .values(data)
      .returning()
      .get();

    return successResponse(newStore, '餐厅添加成功');
  } catch (error) {
    console.error('添加餐厅失败:', error);
    return errorResponse('添加餐厅失败', 500);
  }
});

// 获取所有餐厅
storesRouter.get('/', async (c) => {
  try {
    const db = createDb(c.env);
    const allStores = await db
      .select()
      .from(stores)
      .where(eq(stores.isActive, 1));

    return successResponse(allStores);
  } catch (error) {
    console.error('获取餐厅列表失败:', error);
    return errorResponse('获取餐厅列表失败', 500);
  }
});

// 获取附近餐厅
storesRouter.get('/nearby', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '0');
    const lng = parseFloat(c.req.query('lng') || '0');
    const radius = parseFloat(c.req.query('radius') || '3000');

    const db = createDb(c.env);
    const allStores = await db
      .select()
      .from(stores)
      .where(eq(stores.isActive, 1));

    // 计算距离并过滤
    const nearbyStores = allStores
      .map((store) => ({
        ...store,
        distance: store.latitude && store.longitude
          ? calculateDistance(lat, lng, store.latitude, store.longitude)
          : null,
      }))
      .filter((store) => store.distance !== null && store.distance <= radius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return successResponse(nearbyStores);
  } catch (error) {
    console.error('获取附近餐厅失败:', error);
    return errorResponse('获取附近餐厅失败', 500);
  }
});

export { storesRouter };
