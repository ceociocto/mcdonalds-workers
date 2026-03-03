/**
 * 餐厅搜索API路由
 */

import { Hono } from 'hono';

const app = new Hono();

/**
 * 搜索麦当劳餐厅（使用高德地图API）
 */
app.get('/api/stores/search', async (c) => {
  const { city, keyword } = c.req.query();

  if (!city) {
    return c.json({ success: false, message: '请提供城市参数' }, 400);
  }

  try {
    // 获取高德地图API Key
    const amapApiKey = c.env.AMAP_API_KEY || process.env.AMAP_API_KEY;

    if (!amapApiKey) {
      return c.json({ success: false, message: '未配置高德地图API' }, 500);
    }

    // 构建搜索关键词
    const searchKeyword = keyword ? `麦当劳 ${keyword}` : '麦当劳';

    // 调用高德地图POI搜索API
    const url = `https://restapi.amap.com/v3/place/text?key=${amapApiKey}&keywords=${encodeURIComponent(searchKeyword)}&city=${encodeURIComponent(city)}&output=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1') {
      return c.json({ success: false, message: '高德地图API调用失败' }, 500);
    }

    // 转换为标准格式
    const stores = data.pois.map((poi: any) => {
      // 计算距离（使用城市坐标）
      const cityLat = parseFloat(poi.location.lat);
      const cityLng = parseFloat(poi.location.lon);

      return {
        storeId: `AMAP${poi.id}`,
        id: parseInt(poi.id),
        name: poi.name,
        address: poi.address || `${poi.pname || ''}${poi.cityname || ''}${poi.adname || ''}`,
        latitude: cityLat,
        longitude: cityLng,
        phone: poi.tel || '',
        distance: 0, // 单城市搜索不需要距离
        city: city,
        businessHours: '',
        status: 'open' as const,
      };
    });

    return c.json({
      success: true,
      data: stores,
    });

  } catch (error) {
    console.error('搜索餐厅失败:', error);
    return c.json({
      success: false,
      message: '搜索失败',
      error: error.message,
    }, 500);
  }
});

export default app;
