# 无高德API的替代方案

## 方案对比

### 方案A：高德POI API（当前方案）

**优点**：
```
✅ 数据实时更新
✅ 覆盖全国所有餐厅
✅ 包含完整信息（地址、电话等）
✅ 搜索功能强大
```

**缺点**：
```
❌ 依赖第三方API
❌ 需要配置API Key
❌ 有调用次数限制（虽免费）
```

---

### 方案B：自建数据库（推荐给你）⭐

**核心思路**：
```
自己维护主要城市的餐厅数据
存放在D1数据库中
用户选择城市后直接查询
```

**实现步骤**：

**1. 创建数据库表**
```sql
CREATE TABLE mcdonalds_stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  district TEXT,
  store_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  business_hours TEXT,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_city ON mcdonalds_stores(city);
CREATE INDEX idx_district ON mcdonalds_stores(district);
```

**2. 添加数据（示例）**
```sql
-- 上海热门餐厅
INSERT INTO mcdonalds_stores (city, district, store_id, name, address, phone) VALUES
('上海', '黄浦区', 'SH001', '麦当劳（人民广场店）', '黄浦区人民广场1号', '021-63726789'),
('上海', '黄浦区', 'SH002', '麦当劳（南京路店）', '黄浦区南京东路888号', '021-63226400'),
('上海', '浦东新区', 'SH003', '麦当劳（陆家嘴店）', '浦东新区陆家嘴环路1000号', '021-58881234'),
('上海', '静安区', 'SH004', '麦当劳（静安寺店）', '静安区南京西路1688号', '021-62478888');

-- 北京
INSERT INTO mcdonalds_stores (city, district, store_id, name, address, phone) VALUES
('北京', '朝阳区', 'BJ001', '麦当劳（三里屯店）', '朝阳区三里屯路11号', '010-64171234'),
('北京', '东城区', 'BJ002', '麦当劳（王府井店）', '东城区王府井大街138号', '010-65221234');

-- 广州
INSERT INTO mcdonalds_stores (city, district, store_id, name, address, phone) VALUES
('广州', '天河区', 'GZ001', '麦当劳（天河城店）', '天河区天河路208号', '020-85551234'),
('广州', '越秀区', 'GZ002', '麦当劳（北京路店）', '越秀区北京路234号', '020-83331234');

-- 深圳
INSERT INTO mcdonalds_stores (city, district, store_id, name, address, phone) VALUES
('深圳', '福田区', 'SZ001', '麦当劳（华强北店）', '福田区华强北路1000号', '0755-82781234'),
('深圳', '南山区', 'SZ002', '麦当劳（海岸城店）', '南山区文心五路33号', '0755-86281234');
```

**3. 创建查询API**
```typescript
// workers/routes/stores-db.ts

app.get('/api/stores/by-city', async (c) => {
  const { city, keyword } = c.req.query();

  try {
    let query = 'SELECT * FROM mcdonalds_stores WHERE city = ?';
    const params = [city];

    // 如果有关键词，添加搜索条件
    if (keyword) {
      query += ' AND (name LIKE ? OR address LIKE ? OR district LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const result = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      success: true,
      data: result.results,
    });

  } catch (error) {
    return c.json({
      success: false,
      message: '查询失败',
    }, 500);
  }
});
```

**4. 前端调用**
```typescript
// components/StoreSearch.tsx（修改）

const response = await fetch(
  `${API_BASE_URL}/api/stores/by-city?city=${city}&keyword=${keyword}`
);
```

**优势**：
```
✅ 完全自主，不依赖第三方
✅ 无需配置API Key
✅ 查询速度快（本地数据库）
✅ 数据可控
```

**劣势**：
```
❌ 需要手动维护数据
❌ 新开店需要手动添加
❌ 不如高德数据全面
```

---

### 方案C：混合方案（最灵活）

**核心思路**：
```
主要城市用自建数据库
其他城市用高德API
```

**实现**：
```typescript
async function getStores(city, keyword) {
  // 检查是否在自建数据库中
  const localResult = await queryLocalDB(city, keyword);

  if (localResult.length > 0) {
    return localResult; // 返回本地数据
  } else {
    return await queryAmapAPI(city, keyword); // 使用高德API
  }
}
```

---

## 🎯 我的建议

### 推荐方案B（自建数据库）

**理由**：
```
1. 你主要做特定城市（如上海、北京）
2. 数据量不大（几十到几百家店）
3. 完全自主，不依赖第三方
4. 维护成本低
```

**数据来源**：
```
方式1：手动录入（最准确）
方式2：爬取麦当劳官网一次性数据
方式3：使用高德API导出一次数据，然后自己维护
```

---

## 📝 需要修改的代码

如果你选择方案B，需要修改：

### 1. 数据库初始化
```bash
# 创建表
wrangler d1 execute mcdonalds_db --remote --file=./init-stores-table.sql
```

### 2. 添加数据
```bash
# 插入餐厅数据
wrangler d1 execute mcdonalds_db --remote --command="INSERT INTO mcdonalds_stores ..."
```

### 3. 修改前端组件
```typescript
// StoreSearch.tsx
const response = await fetch(
  `${API_BASE_URL}/api/stores/by-city?city=${city}&keyword=${keyword}`
);
```

---

## 🚀 快速开始（方案B）

如果你决定用自建数据库，我可以帮你：

1. ✅ 创建数据库表结构
2. ✅ 添加主要城市的餐厅数据（上海、北京、广州、深圳）
3. ✅ 修改API路由
4. ✅ 更新前端组件

**大约需要30分钟完成！**

---

总裁，**你要哪种方案？**

1. **继续用高德API**（数据全，但需要配置）
2. **自建数据库**（自主可控，需要维护数据）
3. **混合方案**（灵活，但复杂）

选哪个？😊
