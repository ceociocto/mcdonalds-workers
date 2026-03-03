/**
 * 数据库Schema定义
 * 使用Drizzle ORM for Cloudflare D1
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============== 会员卡表 ==============
export const memberCards = sqliteTable('member_cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: text('card_id').notNull().unique(),
  phone: text('phone').notNull(),
  password: text('password'), // 加密存储
  balance: real('balance').notNull().default(0),
  dailyLimit: integer('daily_limit').notNull().default(5),
  usedToday: integer('used_today').notNull().default(0),
  status: text('status').notNull().default('active'), // active, frozen, expired
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============== 餐厅表 ==============
export const stores = sqliteTable('stores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: text('store_id').notNull().unique(),
  name: text('name').notNull(),
  address: text('address'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  businessHours: text('business_hours'),
  phone: text('phone'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============== 套餐表 ==============
export const combos = sqliteTable('combos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  comboId: text('combo_id').notNull().unique(),
  name: text('name').notNull(),
  originalPrice: real('original_price').notNull(),
  memberPrice: real('member_price').notNull(),
  items: text('items').notNull(), // JSON格式
  category: text('category'), // breakfast, lunch, dinner
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============== 订单表 ==============
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: text('order_id').notNull().unique(),
  userId: text('user_id').notNull(), // 闲鱼用户名
  storeId: text('store_id').notNull(),
  comboId: text('combo_id').notNull(),
  cardId: text('card_id').notNull(),
  amount: real('amount').notNull(),
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  pickupCode: text('pickup_code'),
  mcdOrderId: text('mcd_order_id'),
  items: text('items'), // JSON格式
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// ============== 会员卡使用日志表 ==============
export const cardUsageLogs = sqliteTable('card_usage_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: text('card_id').notNull(),
  orderId: text('order_id').notNull(),
  amount: real('amount').notNull(),
  balanceBefore: real('balance_before'),
  balanceAfter: real('balance_after'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============== 类型定义 ==============
export type MemberCard = typeof memberCards.$inferSelect;
export type NewMemberCard = typeof memberCards.$inferInsert;

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type Combo = typeof combos.$inferSelect;
export type NewCombo = typeof combos.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
