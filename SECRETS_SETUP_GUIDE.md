# 🔑 GitHub Secrets配置指南

## 概述

为了让GitHub Actions自动部署到Cloudflare，需要配置两个Secrets。

---

## 📋 配置清单

### 必需的Secrets

| Secret名称 | 说明 | 获取方式 |
|-----------|------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API令牌 | Dashboard创建 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare账户ID | Wrangler获取 |

---

## 🔧 步骤1: 获取API Token

### 方法A: 通过Dashboard（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击右上角头像 → **My profile**
3. 左侧菜单选择 **API Tokens**
4. 点击 **Create Token**
5. 选择模板 **Edit Cloudflare Workers** 或使用自定义模板

### Token权限配置

```
Account - Cloudflare Workers - Edit
Zone - Zone - Read
Account - Account Settings - Read
```

6. 设置TTL（建议：Never expire）
7. 点击 **Continue to summary** → **Create Token**
8. **复制Token**（只显示一次！）

### 方法B: 通过Wrangler

```bash
# 登录
wrangler login

# 会在浏览器打开授权页面
# 授权后，Token自动保存到 ~/.wrangler/config/default.toml
```

---

## 🔧 步骤2: 获取Account ID

### 方法A: Wrangler命令（最简单）

```bash
wrangler whoami
```

输出示例：
```
⛅️ wrangler 4.69.0
---------------------
Getting User settings...
👋 You are logged in with an OAuth Token, associated with the email 'your-email@example.com'!

🌀 Account info (found on first page of search)
  Account ID: c36141b0ae53a4dbe2a7622b8d12f54a  ← 这个就是Account ID
  Account Name: your-account-name
```

### 方法B: Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择任意一个站点
3. 右侧栏找到 **Account ID**
4. 点击复制

---

## 🔧 步骤3: 配置GitHub Secrets

### 添加Secrets

1. 打开GitHub仓库
   ```
   https://github.com/ceociocto/mcdonalds-workers
   ```

2. 进入 **Settings** → **Secrets and variables** → **Actions**

3. 点击 **New repository secret**

4. 添加第一个Secret：
   ```
   Name: CLOUDFLARE_API_TOKEN
   Secret: [粘贴步骤1获取的Token]
   ```

5. 点击 **Add secret**

6. 点击 **New repository secret** 再次添加

7. 添加第二个Secret：
   ```
   Name: CLOUDFLARE_ACCOUNT_ID
   Secret: [粘贴步骤2获取的Account ID]
   ```

8. 点击 **Add secret**

---

## ✅ 验证配置

### 方法1: 触发部署

```bash
# 提交任意改动
git commit --allow-empty -m "test: trigger deployment"
git push
```

### 方法2: 查看Actions

1. 进入GitHub仓库
2. 点击 **Actions** 标签
3. 查看最新的workflow运行状态

### 成功标志

如果配置正确，你会看到：
```
✅ deploy-workers (绿色勾)
✅ deploy-pages (绿色勾)
```

---

## 🚨 常见问题

### Q1: Token没有足够的权限

**错误信息**：
```
Error: User does not have permission to deploy to this account
```

**解决方法**：
1. 重新创建Token
2. 确保包含以下权限：
   - Account - Cloudflare Workers - Edit
   - Account - Account Settings - Read

### Q2: Account ID不正确

**错误信息**：
```
Error: Account not found
```

**解决方法**：
1. 重新运行 `wrangler whoami`
2. 确保复制的是 **Account ID**（32位十六进制）

### Q3: Pages部署失败

**错误信息**：
```
Project not found
```

**解决方法**：
```bash
# 创建Pages项目
wrangler pages project create mcdonalds-workers --production-branch=main
```

---

## 🔄 更新Secrets

### 如果Token过期或需要更换

1. 进入 **Settings** → **Secrets and variables** → **Actions**
2. 找到要更新的Secret
3. 点击 **Update** 更新值
4. 或点击 **Remove** 删除后重新添加

---

## 📚 快速参考

### Wrangler常用命令

```bash
# 登录
wrangler login

# 查看账户信息
wrangler whoami

# 查看Workers列表
wrangler deployments list --name mcdonalds-workers

# 查看Pages项目
wrangler pages project list
```

### 获取Token链接

- [API Tokens页面](https://dash.cloudflare.com/profile/api-tokens)
- [Workers Token模板](https://dash.cloudflare.com/profile/api-tokens/create/template/Workers+Editor+Template)

---

## 🎯 下一步

配置完成后：

1. ✅ 提交代码触发自动部署
2. ✅ 访问生产环境验证
3. ✅ 开始正常开发流程

---

总裁，按照这个指南配置5分钟就能搞定！

需要我帮你检查配置是否正确吗？😊
