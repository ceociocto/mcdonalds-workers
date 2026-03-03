# 🔧 前端API 404错误修复

## 问题描述

前端在本地开发时，API调用返回404错误：

```
GET /api/stores/nearby/?lat=31.2304&lng=121.4737&radius=10000 404
```

---

## 🔍 原因分析

### 问题根源
Next.js开发服务器将 `/api/*` 路径识别为Next.js API路由，而不是转发到Cloudflare Workers API。

### 错误流程
```
浏览器请求
  ↓
Next.js开发服务器 (localhost:3000)
  ↓
尝试处理 /api/stores/nearby/
  ↓
404 Not Found (本地没有这个API路由)
```

### 正确流程
```
浏览器请求
  ↓
直接发送到 Cloudflare Workers
  ↓
https://mcdonalds-workers.lijieisme.workers.dev/api/stores/nearby/
  ↓
200 OK (返回数据)
```

---

## ✅ 解决方案

### 1. 创建环境变量文件

已创建 `.env.local` 文件：

```bash
# Cloudflare Workers API地址
NEXT_PUBLIC_API_URL=https://mcdonalds-workers.lijieisme.workers.dev
```

### 2. 重启开发服务器

**方法A: 使用脚本**
```bash
./start-dev.sh
```

**方法B: 手动启动**
```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

### 3. 验证修复

访问 http://localhost:3000，应该能看到：
- ✅ 餐厅列表正常加载
- ✅ 套餐列表正常显示
- ✅ API请求成功（200 OK）

---

## 📋 环境变量说明

### NEXT_PUBLIC_API_URL

**作用**: 指定Cloudflare Workers API的地址

**本地开发**:
```bash
NEXT_PUBLIC_API_URL=https://mcdonalds-workers.lijieisme.workers.dev
```

**生产环境**:
- 在Next.js构建时自动设置
- 无需手动配置

**其他环境**:
```bash
# 如需使用本地Workers开发服务器
NEXT_PUBLIC_API_URL=http://localhost:8787
```

---

## 🚀 完整开发流程

### 启动开发环境

```bash
# 1. 启动后端（可选，用于本地API开发）
npm run workers:dev

# 2. 启动前端
npm run dev

# 3. 访问
# 前端: http://localhost:3000
# 后端: http://localhost:8787 (如果启动)
```

### 开发时使用

**推荐**: 使用生产API（默认配置）
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://mcdonalds-workers.lijieisme.workers.dev
```

**原因**:
- ✅ 无需启动本地Workers
- ✅ 数据实时同步
- ✅ 简化开发流程

---

## 🧪 测试步骤

### 1. 检查环境变量
```bash
cat .env.local
# 应该显示: NEXT_PUBLIC_API_URL=https://mcdonalds-workers.lijieisme.workers.dev
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
```
打开浏览器: http://localhost:3000
```

### 4. 验证API调用
```
打开浏览器开发者工具 (F12)
查看 Network 标签
应该看到:
  ✅ GET https://mcdonalds-workers.lijieisme.workers.dev/api/stores/nearby/...
  ✅ Status: 200 OK
```

---

## 🎯 常见问题

### Q1: 修改.env.local后没有生效

**解决方法**:
```bash
# 完全重启开发服务器
# 1. 停止服务器 (Ctrl+C)
# 2. 重新启动
npm run dev
```

### Q2: 还是404错误

**检查清单**:
```bash
# 1. 确认.env.local存在
ls -la .env.local

# 2. 确认内容正确
cat .env.local

# 3. 确认组件使用API_BASE_URL
grep -r "API_BASE_URL" components/

# 4. 清除浏览器缓存
# 或使用无痕模式访问
```

### Q3: 想使用本地Workers API

**配置**:
```bash
# 1. 启动本地Workers
npm run workers:dev

# 2. 修改.env.local
NEXT_PUBLIC_API_URL=http://localhost:8787

# 3. 重启前端
npm run dev
```

---

## 📚 相关文件

```
mcdonalds-workers/
├── .env.local                 # 环境变量（新建）
├── lib/config.ts              # API配置
├── components/
│   ├── StoreSelector.tsx      # 使用API_BASE_URL
│   ├── ComboSelector.tsx      # 使用API_BASE_URL
│   └── OrderSummary.tsx       # 使用API_BASE_URL
└── start-dev.sh               # 启动脚本
```

---

总裁，**修复已完成**！现在重启开发服务器就可以正常使用了。😊

运行 `npm run dev` 或 `./start-dev.sh` 启动！
