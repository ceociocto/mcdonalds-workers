/**
 * 餐厅服务 - 省市+关键词搜索方案
 */

/**
 * 中国主要城市列表
 */
export const PROVINCES = {
  '北京': ['北京市'],
  '上海': ['上海市'],
  '广东': ['广州市', '深圳市', '东莞市', '佛山市', '珠海市', '惠州市', '中山市'],
  '江苏': ['南京市', '苏州市', '无锡市', '常州市', '徐州市', '南通市'],
  '浙江': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市'],
  '四川': ['成都市', '绵阳市', '德阳市', '宜宾市', '南充市'],
  '湖北': ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄冈市'],
  '福建': ['福州市', '厦门市', '泉州市', '漳州市', '莆田市'],
  '山东': ['济南市', '青岛市', '烟台市', '潍坊市', '临沂市'],
  '河南': ['郑州市', '洛阳市', '南阳市', '新乡市', '开封市'],
  '湖南': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市'],
  '安徽': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市'],
  '陕西': ['西安市', '宝鸡市', '咸阳市', '渭南市', '汉中市'],
  '重庆': ['重庆市'],
  '天津': ['天津市'],
};

/**
 * 热门城市
 */
export const HOT_CITIES = [
  '北京市', '上海市', '广州市', '深圳市',
  '杭州市', '成都市', '武汉市', '西安市',
  '南京市', '重庆市', '天津市', '苏州市'
];

/**
 * 城市坐标映射（用于API调用）
 */
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '北京市': { lat: 39.9042, lng: 116.4074 },
  '上海市': { lat: 31.2304, lng: 121.4737 },
  '广州市': { lat: 23.1291, lng: 113.2644 },
  '深圳市': { lat: 22.5431, lng: 114.0579 },
  '杭州市': { lat: 30.2741, lng: 120.1551 },
  '成都市': { lat: 30.5728, lng: 104.0668 },
  '武汉市': { lat: 30.5928, lng: 114.3055 },
  '西安市': { lat: 34.3416, lng: 108.9398 },
  '南京市': { lat: 32.0603, lng: 118.7969 },
  '重庆市': { lat: 29.4316, lng: 106.9123 },
  '天津市': { lat: 39.0842, lng: 117.2009 },
  '苏州市': { lat: 31.2989, lng: 120.5853 },
};

/**
 * 搜索麦当劳餐厅（使用高德地图API）
 */
export async function searchMcDonaldsStores(
  city: string,
  keyword: string,
  apiKey: string
): Promise<any[]> {
  try {
    // 获取城市坐标
    const cityCoord = CITY_COORDINATES[city];
    if (!cityCoord) {
      throw new Error(`未找到城市坐标: ${city}`);
    }

    // 调用高德地图POI搜索API
    const searchKeyword = keyword ? `麦当劳 ${keyword}` : '麦当劳';
    const url = `https://restapi.amap.com/v3/place/text?key=${apiKey}&keywords=${encodeURIComponent(searchKeyword)}&city=${encodeURIComponent(city)}&output=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1') {
      throw new Error('高德地图API调用失败');
    }

    // 转换为标准格式
    const stores = data.pois.map((poi: any) => {
      // 计算距离（使用城市中心点）
      const distance = calculateDistance(
        cityCoord.lat,
        cityCoord.lng,
        parseFloat(poi.location.lat),
        parseFloat(poi.location.lon)
      );

      return {
        storeId: `AMAP${poi.id}`,
        name: poi.name,
        address: poi.address || (poi.pname || '') + (poi.cityname || '') + (poi.adname || ''),
        latitude: parseFloat(poi.location.lat),
        longitude: parseFloat(poi.location.lon),
        phone: poi.tel || '',
        distance: Math.round(distance),
        city: city,
        businessHours: '', // 高德API不返回营业时间
        status: 'open' as const,
      };
    });

    return stores;

  } catch (error) {
    console.error('搜索餐厅失败:', error);
    return [];
  }
}

/**
 * 获取城市推荐餐厅（不使用关键词）
 */
export async function getCityRecommendedStores(
  city: string,
  apiKey: string
): Promise<any[]> {
  return searchMcDonaldsStores(city, '', apiKey);
}

/**
 * 计算两点距离（米）
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 地球半径（米）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 从搜索结果中筛选和排序
 */
export function filterAndSortStores(
  stores: any[],
  options: {
    maxDistance?: number; // 最大距离（米）
    limit?: number; // 返回数量限制
    sortBy?: 'distance' | 'name'; // 排序方式
  } = {}
): any[] {
  let filtered = stores;

  // 距离筛选
  if (options.maxDistance) {
    filtered = filtered.filter(s => s.distance <= options.maxDistance!);
  }

  // 排序
  if (options.sortBy === 'distance') {
    filtered.sort((a, b) => a.distance - b.distance);
  } else if (options.sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  }

  // 限制数量
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}
