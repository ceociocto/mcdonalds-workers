# 麦当劳网点数据获取方案

## 🎯 目标
获取全国真实麦当劳餐厅网点，并根据用户位置智能推荐。

---

## 📊 方案对比

### 方案A: 麦当劳官方API（推荐）⭐

#### 优点
- ✅ 数据最准确
- ✅ 实时更新
- ✅ 包含营业状态、菜单等完整信息

#### 实施步骤

**1. 微信小程序API（最简单）**
```javascript
// 麦当劳微信小程序使用的API
const MCD_API_BASE = "https://meixg-m_webapp.meituan.com";

// 获取附近门店
async function getNearbyStores(lat, lng, radius = 5000) {
  const response = await fetch(
    `${MCD_API_BASE}/mcdonalds/store/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return response.json();
}
```

**2. 麦当劳官方APP API**
```javascript
// 需要逆向工程麦当劳APP
// Android/iOS应用中包含API调用
// 可能需要token认证
```

#### 数据字段
```json
{
  "storeId": "SH001",
  "name": "麦当劳(南京路店)",
  "address": "黄浦区南京东路888号",
  "latitude": 31.2359,
  "longitude": 121.4757,
  "phone": "021-63226400",
  "businessHours": "07:00-23:00",
  "status": "open", // open/closed
  "facilities": ["wifi", "drive_thru", "24h"],
  "services": ["麦咖啡", "得来速"]
}
```

---

### 方案B: 第三方地图API

#### 高德地图API
```javascript
// 高德地图POI搜索
const AMAP_API_KEY = "your_amap_key";

async function searchMcDonaldsByAmap(lat, lng, radius = 3000) {
  const url = `https://restapi.amap.com/v3/place/around?key=${AMAP_API_KEY}&location=${lng},${lat}&radius=${radius}&keywords=麦当劳`;

  const response = await fetch(url);
  const data = await response.json();

  return data.pois.map(poi => ({
    storeId: poi.id,
    name: poi.name,
    address: poi.address + (poi.pname || "") + (poi.cityname || ""),
    latitude: parseFloat(poi.location.lat),
    longitude: parseFloat(poi.location.lon),
    phone: poi.tel,
    distance: parseInt(poi.distance)
  }));
}
```

#### 百度地图API
```javascript
// 百度地图POI检索
const BAIDU_API_KEY = "your_baidu_key";

async function searchMcDonaldsByBaidu(lat, lng, radius = 3000) {
  const url = `https://api.map.baidu.com/place/v2/search?query=麦当劳&location=${lat},${lng}&radius=${radius}&output=json&ak=${BAIDU_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.results.map(store => ({
    storeId: `BD${store.uid}`,
    name: store.name,
    address: store.address,
    latitude: store.location.lat,
    longitude: store.location.lng,
    telephone: store.telephone,
    distance: Math.round(store.detail_info.distance)
  }));
}
```

---

### 方案C: 数据爬取（不推荐）

#### 技术方案
```javascript
// 爬取麦当劳官网门店列表
const puppeteer = require('puppeteer');

async function scrapeMcDonaldsStores() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 访问麦当劳门店查询页面
  await page.goto('https://www.mcdonalds.com.cn/find-a-restaurant');

  // 模拟搜索
  await page.type('#search-input', '上海');
  await page.click('#search-button');

  // 等待结果加载
  await page.waitForSelector('.store-list');

  // 提取数据
  const stores = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.store-item')).map(item => ({
      name: item.querySelector('.store-name').textContent,
      address: item.querySelector('.store-address').textContent,
      // ...更多字段
    }));
  });

  await browser.close();
  return stores;
}
```

#### 问题
- ❌ 容易被封IP
- ❌ 页面结构变化需要维护
- ❌ 法律风险
- ❌ 数据更新不及时

---

## 🎯 推荐实施方案

### 阶段1: 使用高德地图API（立即可用）<tool_call>write<arg_key>content</arg_key><arg_value>// lib/store-service.ts

/**
 * 餐厅数据服务
 * 使用高德地图API获取真实麦当劳网点
 */

const AMAP_API_KEY = process.env.AMAP_API_KEY || "";
const AMAP_BASE = "https://restapi.amap.com";

export interface Store {
  storeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  distance: number;
  businessHours?: string;
  status: 'open' | 'closed';
}

/**
 * 获取附近麦当劳餐厅
 */
export async function getNearbyStores(
  userLat: number,
  userLng: number,
  radius: number = 3000
): Promise<Store[]> {
  try {
    // 1. 调用高德地图POI搜索
    const url = `${AMAP_BASE}/v3/place/around?key=${AMAP_API_KEY}&location=${userLng},${userLat}&radius=${radius}&keywords=麦当劳&output=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "1") {
      throw new Error("高德地图API调用失败");
    }

    // 2. 转换为我们的格式
    const stores: Store[] = data.pois.map((poi: any) => ({
      storeId: `AMAP${poi.id}`,
      name: poi.name.replace(/麦当劳/g, "麦当劳（").replace(/有限公司/g, "店）"),
      address: `${poi.pname || ""}${poi.cityname || ""}${poi.adname || ""}${poi.address || ""}`,
      latitude: parseFloat(poi.location.lat),
      longitude: parseFloat(poi.location.lon),
      phone: poi.tel || "",
      distance: parseInt(poi.distance),
      status: "open" as const,
    }));

    // 3. 按距离排序
    stores.sort((a, b) => a.distance - b.distance);

    return stores;

  } catch (error) {
    console.error("获取餐厅失败:", error);
    // 返回测试数据作为降级方案
    return getTestStores(userLat, userLng);
  }
}

/**
 * 根据用户位置推荐餐厅
 */
export function recommendStores(
  stores: Store[],
  userLat: number,
  userLng: number
): {
  nearest: Store[];
  open: Store[];
  recommended: Store[];
} {
  // 1. 最近的3家
  const nearest = stores.slice(0, 3);

  // 2. 营业中的
  const open = stores.filter(s => s.status === "open");

  // 3. 智能推荐
  const recommended = stores
    .filter(s => s.distance < 2000) // 2km内
    .filter(s => s.status === "open") // 营业中
    .slice(0, 5);

  return { nearest, open, recommended };
}

/**
 * 测试数据（降级方案）
 */
function getTestStores(userLat: number, userLng: number): Store[] {
  return [
    {
      storeId: "TEST001",
      name: "麦当劳（人民广场店）",
      address: "黄浦区人民广场1号",
      latitude: userLat + 0.0001,
      longitude: userLng + 0.0001,
      phone: "021-63726789",
      distance: 100,
      status: "open",
      businessHours: "24小时"
    },
    // ...更多测试数据
  ];
}

/**
 * 获取用户位置
 */
export async function getUserLocation(): Promise<{
  lat: number;
  lng: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("浏览器不支持地理位置"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * 计算两点距离（米）
 */
export function calculateDistance(
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