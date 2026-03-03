/**
 * Cloudflare Workers 主入口
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleCors } from '../../lib/utils';

type Env = {
  DB: D1Database;
  // CACHE: KVNamespace; // 暂时禁用
};

const app = new Hono<{ Bindings: Env }>();

// CORS中间件
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ============== 基础路由 ==============

app.get('/', (c) => {
  return c.json({
    success: true,
    message: '麦当劳代下单服务 API',
    version: '2.0.0',
    platform: 'Cloudflare Workers',
    endpoints: {
      health: '/health',
      cards: '/api/cards',
      stores: '/api/stores',
      combos: '/api/combos',
      orders: '/api/orders',
    },
  });
});

app.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    service: 'mcdonalds-workers',
    timestamp: new Date().toISOString(),
  });
});

// ============== API路由 ==============

// 会员卡管理
import { cardsRouter } from './routes/cards';
app.route('/api/cards', cardsRouter);

// 餐厅管理
import { storesRouter } from './routes/stores';
app.route('/api/stores', storesRouter);

// 餐厅数据库查询
import { storesDbRouter } from './routes/stores-db';

// 套餐管理
import { combosRouter } from './routes/combos';
app.route('/api/combos', combosRouter);

// 订单管理
import { ordersRouter } from './routes/orders';
app.route('/api/orders', ordersRouter);

// ============== 错误处理 ==============

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      success: false,
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not found',
      path: c.req.path,
    },
    404
  );
});

// ============== 导出 ==============

export default app;
