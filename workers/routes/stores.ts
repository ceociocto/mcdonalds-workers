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

// ============== 数据库查询路由 ==============

/**
 * 根据城市查询餐厅（支持关键词搜索）
 */
storesRouter.get('/by-city', async (c) => {
  const { city, keyword } = c.req.query();

  if (!city) {
    return c.json({ success: false, message: '请提供城市参数' }, 400);
  }

  try {
    let query = 'SELECT * FROM mcdonalds_stores WHERE city = ? AND status = ?';
    const params = [city, 'active'];

    // 如果有关键词，添加搜索条件
    if (keyword && keyword.trim()) {
      query += ' AND (name LIKE ? OR address LIKE ? OR district LIKE ?)';
      const keywordPattern = `%${keyword.trim()}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern);
    }

    query += ' ORDER BY id ASC';

    const result = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      success: true,
      data: result.results,
    });

  } catch (error) {
    console.error('查询餐厅失败:', error);
    return c.json({
      success: false,
      message: '查询失败',
      error: error.message,
    }, 500);
  }
});

/**
 * 获取所有城市列表
 */
storesRouter.get('/cities', async (c) => {
  try {
    const query = `
      SELECT city, COUNT(*) as count
      FROM mcdonalds_stores
      WHERE status = 'active'
      GROUP BY city
      ORDER BY count DESC
    `;

    const result = await c.env.DB.prepare(query).all();

    return c.json({
      success: true,
      data: result.results.map(row => ({
        city: row.city,
        storeCount: row.count
      })),
    });

  } catch (error) {
    console.error('获取城市列表失败:', error);
    return c.json({
      success: false,
      message: '获取城市列表失败',
      error: error.message,
    }, 500);
  }
});

/**
 * 根据城市获取区域列表
 */
storesRouter.get('/districts', async (c) => {
  const { city } = c.req.query();

  if (!city) {
    return c.json({ success: false, message: '请提供城市参数' }, 400);
  }

  try {
    const query = `
      SELECT district, COUNT(*) as count
      FROM mcdonalds_stores
      WHERE city = ? AND status = 'active'
      GROUP BY district
      ORDER BY count DESC
    `;

    const result = await c.env.DB.prepare(query).bind(city).all();

    return c.json({
      success: true,
      data: result.results.map(row => ({
        district: row.district,
        storeCount: row.count
      })),
    });

  } catch (error) {
    console.error('获取区域列表失败:', error);
    return c.json({
      success: false,
      message: '获取区域列表失败',
      error: error.message,
    }, 500);
  }
});

// ============== 原有路由 ==============

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
