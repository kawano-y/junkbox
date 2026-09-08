import { DatabaseSync } from 'node:sqlite';

// 1. DBインスタンスの生成
export const db = new DatabaseSync('dev.db');

// 2. テーブル初期化関数
export const initDb = () => {
  // Performance向上用（WALモード）
  db.exec('PRAGMA journal_mode = WAL;');

  // スレッドテーブルの作成
  db.exec(`
    CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 投稿テーブルの作成
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized successfully.');
};
