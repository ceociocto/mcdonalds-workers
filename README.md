# 🍔 麦当劳代下单服务 - 统一工程

> 全栈自动化下单平台 - Workers + Pages

---

## 📦 项目结构

```
mcdonalds-workers/
├── .github/workflows/    # GitHub Actions自动部署
├── app/                  # Next.js前端（App Router）
├── components/           # React组件
├── lib/                  # 共享代码
├── workers/              # Cloudflare Workers后端
├── drizzle/              # 数据库迁移
├── out/                  # Pages构建输出（生成后）
└── wrangler.toml         # Cloudflare配置
```

---

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev
# 访问 http://localhost:3000

# 启动后端开发服务器
npm run workers:dev
# 访问 http://localhost:8787
```

### 构建

```bash
# 构建前端静态文件
npm run build
# 输出到 out/ 目录
```

### 部署

```bash
# 部署Workers（后端）
npm run workers:deploy

# 部署Pages（前端）
wrangler pages deploy out --project-name=mcdonalds-workers
```

---

## 🔄 自动部署（GitHub Actions）

### 配置

项目已配置GitHub Actions，提交代码到main分支会自动触发部署：

1. **Workers部署** - 后端API
2. **Pages部署** - 前端界面

### Secrets配置

需要在GitHub仓库中配置以下Secrets：

```
CLOUDFLARE_API_TOKEN       # Cloudflare API令牌
CLOUDFLARE_ACCOUNT_ID      # Cloudflare账户ID
```

### 获取方式

```bash
# 登录Cloudflare
wrangler login

# 获取API Token
# 访问: https://dash.cloudflare.com/profile/api-tokens

# 获取Account ID
wrangler whoami
```

---

## 🌐 生产环境

### 访问地址

```
前端: https://mcdonalds-workers.pages.dev
后端: https://mcdonalds-workers.lijieisme.workers.dev
```

### API配置

前端通过环境变量调用后端API：

```typescript
// lib/config.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mcdonalds-workers.lijieisme.workers.dev';
```

---

## 📊 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js 15 + React 19 | 静态导出到Pages |
| 后端 | Hono + TypeScript | Workers API |
| 数据库 | D1 (SQLite) | 边缘数据库 |
| CI/CD | GitHub Actions | 自动部署 |
| 托管 | Cloudflare | 全栈部署 |

---

## 🎯 工作流程

### 开发流程

```
1. 本地开发
   npm run dev           # 前端
   npm run workers:dev   # 后端

2. 提交代码
   git add .
   git commit -m "feat: xxx"
   git push

3. 自动部署
   GitHub Actions → Workers → Pages
```

### 部署流程

```
push to main
    ↓
GitHub Actions触发
    ↓
① 部署Workers（API）
    ↓
② 构建Next.js
    ↓
③ 部署Pages（前端）
    ↓
完成 ✅
```

---

## 🔧 配置文件

### wrangler.toml
```toml
name = "mcdonalds-workers"
main = "workers/index.ts"
pages_build_output_dir = "out"

[[d1_databases]]
binding = "DB"
database_id = "21325584-1e36-4192-8bb1-d254cdc59f23"
```

### next.config.ts
```typescript
export default {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};
```

---

## 📝 命令参考

```bash
# 开发
npm run dev              # 前端
npm run workers:dev      # 后端

# 构建
npm run build            # 构建前端

# 部署
npm run workers:deploy   # 部署Workers
wrangler pages deploy    # 部署Pages

# 数据库
npm run db:generate      # 生成迁移
npm run db:migrate       # 执行迁移
npm run db:studio        # 打开Studio
```

---

## 🎊 项目优势

### ✅ 统一管理
- 前后端代码在同一仓库
- 统一的依赖管理
- 简化的部署流程

### ✅ 自动化
- Git提交自动触发部署
- CI/CD自动化测试
- 零停机部署

### ✅ 边缘计算
- 全球300+节点
- 毫秒级响应
- 免费额度充足

---

## 💡 最佳实践

### 1. 分支管理
```bash
main          # 生产分支（自动部署）
develop       # 开发分支
feature/*     # 功能分支
```

### 2. 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
deploy: 部署配置
```

### 3. 环境变量
```bash
# .env.local（本地）
NEXT_PUBLIC_API_URL=http://localhost:8787

# 生产环境
NEXT_PUBLIC_API_URL=https://mcdonalds-workers.lijieisme.workers.dev
```

---

总裁，现在**所有代码统一管理**，Git提交自动部署！🚀

需要我帮你配置GitHub Secrets吗？
