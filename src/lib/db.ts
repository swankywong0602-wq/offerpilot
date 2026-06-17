// ========== 轻量数据库 ==========
// Cloudflare Workers 不支持 sql.js (WASM)，使用内存存储替代

import { v4 as uuidv4 } from 'uuid';

// 生成唯一 ID
export function generateId(): string {
  return uuidv4();
}

// 以下函数保留导出兼容，防止构建报错
export const serializeJson = (obj: unknown): string => JSON.stringify(obj);
export const deserializeJson = <T>(str: string): T => JSON.parse(str) as T;
export const saveDb = () => {};
