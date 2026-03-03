# 🍔 麦当劳代下单服务

基于 Next.js 15 + Cloudflare Workers 的自动化麦当劳代下单平台

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

## ✨ 特性

- 🌍 **全球边缘部署** - Cloudflare Workers 300+ 节点
- ⚡ **毫秒级响应** - 15ms 冷启动时间
- 💰 **零成本起步** - 免费额度 100k 请求/天
- 🔒 **类型安全** - TypeScript + Drizzle ORM
- 🎯 **智能匹配** - 自动选择最优会员卡
- 🤖 **全自动** - 从下单到取餐码生成

## 🚀 在线体验

**生产环境**: https://mcdonalds-workers.lijieisme.workers.dev

**GitHub仓库**: https://github.com/ceociocto/mcdonalds-workers

## 📋 核心功能

### 智能会员卡管理
```typescript
✅ 自动匹配可用会员卡（余额+限额）
✅ 优先使用今日次数少的卡
✅ 自动扣减余额
✅ 使用日志完整记录
```

### 自动下单流程
```typescript
✅ 验证餐厅和套餐
✅ 智能匹配会员卡
✅ 生成订单号
✅ 生成取餐码
✅ 订单状态追踪
```

## 🛠️ 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端** | Next.js 15 | App Router + RSC |
| **后端** | Cloudflare Workers | 边缘计算 |
| **框架** | Hono | 轻量级 Web 框架 |
| **数据库** | Cloudflare D1 | 边缘 SQLite |
| **ORM** | Drizzle ORM | TypeScript-first |
| **样式** | TailwindCSS | 实用优先 |
| **语言** | TypeScript | 类型安全 |

## 📡 API 端点

### 基础
```bash
# 健康检查
GET /health

# API 信息
GET /
```

### 会员卡管理
```bash
# 添加会员卡
POST /api/cards

# 查询所有会员卡
GET /api/cards

# 查询可用会员卡
GET /api/cards/available/:amount
```

### 餐厅管理
```bash
# 查询所有餐厅
GET /api/stores

# 查询附近餐厅
GET /api/stores/nearby?lat=31.2304&lng=121.4737&radius=3000
```

### 套餐管理
```bash
# 查询所有套餐
GET /api/combos

# 查询预算内套餐
GET /api/combos/budget/:budget
```

### 订单管理
```bash
# 创建订单
POST /api/orders

# 查询订单
GET /api/orders/:orderId

# 查询用户订单
GET /api/orders/user/:userId
```

## 📦 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动 Next.js（前端）
npm run dev

# 启动 Workers（后端）
npm run workers:dev
```

### 部署到 Cloudflare

```bash
# 部署 Workers
npm run workers:deploy

# 查看 Workers 日志
wrangler tail
```

## 🗄️ 数据库初始化

```bash
# 创建数据库表
wrangler d1 execute mcdonalds_db --remote --file=./drizzle/0000_init.sql
```

## 📁 项目结构

```
mcdonalds-workers/
├── app/                  # Next.js App Router
├── workers/             # Cloudflare Workers
│   ├── index.ts        # Workers 入口
│   └── routes/         # API 路由
├── lib/                # 共享代码
│   ├── schema.ts      # 数据库 Schema
│   ├── db.ts          # D1 连接
│   └── utils.ts       # 工具函数
├── drizzle/            # 数据库迁移
├── wrangler.toml      # Cloudflare 配置
└── package.json
```

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| **冷启动** | 15ms |
| **全球节点** | 300+ |
| **免费额度** | 100k 请求/天 |
| **月成本** | $0-5 |
| **响应时间** | < 50ms (P95) |

## 🎯 业务流程

```
用户（闲鱼）
  ↓
选择餐厅
  ↓
选择套餐
  ↓
智能匹配会员卡
  ↓
自动下单到麦当劳
  ↓
生成取餐码
  ↓
完成订单
```

## 🚧 待开发

- [ ] 接入真实麦当劳 API
- [ ] 开发完整前端界面
- [ ] 集成高德地图
- [ ] 闲鱼商品上架
- [ ] 短信通知
- [ ] 数据统计面板

## 📄 License

MIT License

## 👤 作者

ceociocto

---

**Made with ❤️ using Next.js + Cloudflare Workers**
