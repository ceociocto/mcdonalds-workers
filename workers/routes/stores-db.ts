/**
 * 餐厅查询API路由（从数据库查询）
 */

import { Hono } from 'hono';

const app = new Hono();

/**
 * 根据城市查询餐厅（支持关键词搜索）
 */
app.get('/api/stores/by-city', async (c) => {
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
app.get('/api/stores/cities', async (c) => {
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
app.get('/api/stores/districts', async (c) => {
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

/**
 * 获取餐厅详情
 */
app.get('/api/stores/:storeId', async (c) => {
  const { storeId } = c.req.param();

  try {
    const query = 'SELECT * FROM mcdonalds_stores WHERE store_id = ?';
    const result = await c.env.DB.prepare(query).bind(storeId).first();

    if (!result) {
      return c.json({
        success: false,
        message: '餐厅不存在',
      }, 404);
    }

    return c.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('获取餐厅详情失败:', error);
    return c.json({
      success: false,
      message: '获取餐厅详情失败',
      error: error.message,
    }, 500);
  }
});

export default app;
