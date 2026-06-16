// ========== SQLite 数据库 (基于 sql.js，纯 JS 无需编译) ==========

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { v4 as uuidv4 } from 'uuid';

let db: SqlJsDatabase | null = null;

// 初始化数据库（单例）
export async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs();

  // 尝试从 localStorage 加载已有数据（仅在浏览器环境）
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('offerpilot_db');
    if (saved) {
      const uint8 = new Uint8Array(JSON.parse(saved));
      db = new SQL.Database(uint8);
    } else {
      db = new SQL.Database();
    }
  } else {
    // 服务端：每次创建内存数据库，但会初始化表结构
    db = new SQL.Database();
  }

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      plan TEXT DEFAULT 'free',
      daily_usage INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      content TEXT,
      file_name TEXT,
      uploaded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      resume_id TEXT,
      job_description TEXT,
      score INTEGER,
      strengths TEXT,
      weaknesses TEXT,
      ats_score INTEGER,
      suggestions TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (resume_id) REFERENCES resumes(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS optimized_resumes (
      id TEXT PRIMARY KEY,
      resume_id TEXT,
      original_content TEXT,
      optimized_content TEXT,
      changes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (resume_id) REFERENCES resumes(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS interview_results (
      id TEXT PRIMARY KEY,
      resume_id TEXT,
      job_description TEXT,
      questions TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (resume_id) REFERENCES resumes(id)
    )
  `);

  return db;
}

// ========== 辅助函数 ==========

// 保存数据库（客户端用）
export function saveDb() {
  if (!db) return;
  const uint8 = db.export();
  const arr = Array.from(uint8);
  if (typeof window !== 'undefined') {
    localStorage.setItem('offerpilot_db', JSON.stringify(arr));
  }
}

// 序列化 JSON 字段
export function serializeJson(obj: unknown): string {
  return JSON.stringify(obj);
}

// 反序列化 JSON 字段
export function deserializeJson<T>(str: string): T {
  return JSON.parse(str) as T;
}

// 生成唯一 ID
export function generateId(): string {
  return uuidv4();
}
