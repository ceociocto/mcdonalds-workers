/**
 * 数据库连接配置
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
  ENVIRONMENT?: string;
};

/**
 * 创建数据库连接
 */
export function createDb(env: Env) {
  return drizzle(env.DB, { schema });
}

/**
 * 数据库实例类型
 */
export type Db = ReturnType<typeof createDb>;
