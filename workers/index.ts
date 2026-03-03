/**
 * Cloudflare Workers 主入口 - 全栈架构
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleCors } from '../../lib/utils';

type Env = {
  DB: D1Database;
  // CACHE: KVNamespace; // 暂时禁用
};

const app = new Hono<{ Bindings: Env }>();

// ============== 前端静态文件服务 ==============

// 前端HTML
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>麦当劳代下单服务</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div id="app"></div>
  <script>
    // 前端应用入口
    const API_BASE = window.location.origin;

    async function loadStores() {
      const response = await fetch(\`\${API_BASE}/api/stores/cities\`);
      const data = await response.json();

      if (data.success) {
        const app = document.getElementById('app');
        app.innerHTML = \`
          <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4">
              <h1 class="text-3xl font-bold mb-6">🍔 麦当劳代下单</h1>
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">选择城市</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  \${data.data.map(city => \`
                    <button
                      onclick="selectCity('\${city.city}')"
                      class="p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition"
                    >
                      \${city.city}<br>
                      <span class="text-sm opacity-90">\${city.storeCount}家餐厅</span>
                    </button>
                  \`).join('')}
                </div>
              </div>
            </div>
          </div>
        \`;
      }
    }

    async function selectCity(city) {
      const response = await fetch(\`\${API_BASE}/api/stores/by-city?city=\${encodeURIComponent(city)}\`);
      const data = await response.json();

      if (data.success) {
        const app = document.getElementById('app');
        app.innerHTML = \`
          <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4">
              <button onclick="loadStores()" class="mb-4 text-blue-600">← 返回</button>
              <h1 class="text-3xl font-bold mb-6">🍔 \${city}</h1>
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">找到 \${data.data.length} 家餐厅</h2>
                <div class="space-y-3">
                  \${data.data.map(store => \`
                    <div class="p-4 border rounded-lg hover:bg-gray-50">
                      <h3 class="font-semibold">\${store.name}</h3>
                      <p class="text-sm text-gray-600">\${store.address}</p>
                      <p class="text-sm text-gray-500">📞 \${store.phone}</p>
                    </div>
                  \`).join('')}
                </div>
              </div>
            </div>
          </div>
        \`;
      }
    }

    // 启动应用
    loadStores();
  </script>
</body>
</html>
  `);
});

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
