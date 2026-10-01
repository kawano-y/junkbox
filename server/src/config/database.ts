import { DatabaseSync } from 'node:sqlite';
import { calculateQuote } from '../domain/quote';

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
  // ユーザーテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      name TEXT,
      picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // チャットルームテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_private INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // メッセージテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);



  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id            TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      status        TEXT NOT NULL
                    CHECK (status IN ('draft','sent','accepted','rejected','ordered')),
      valid_until   TEXT NOT NULL,  -- ISO 8601（例: 2026-10-31T23:59:59.999+09:00）
      totals_json   TEXT NOT NULL   -- QuoteTotals をJSON文字列で保存
    );

    CREATE TABLE IF NOT EXISTS orders (
      id            TEXT PRIMARY KEY,
      quote_id      TEXT NOT NULL UNIQUE REFERENCES quotes(id),
      customer_name TEXT NOT NULL,
      totals_json   TEXT NOT NULL,
      ordered_at    TEXT NOT NULL
    );
  `);


  // 2. テスト用デフォルトデータの準備（存在しない場合のみ挿入）
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, username, email, password_hash, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  insertUser.run(
    'test-user-001',
    'testuser',
    'test@example.com',
    'dummy_password_hash'
  );
  
  const insertRoom = db.prepare(`INSERT OR IGNORE INTO rooms (id, name) VALUES (?, ?)`);
  insertRoom.run('room1', 'テストルーム');


  const totals = calculateQuote([
    { name: '開発', quantity: 1, unitPrice: 100000, taxRate: 10 },
  ]);

  db.prepare(
    `INSERT OR IGNORE INTO quotes (id, customer_name, status, valid_until, totals_json)
    VALUES (?, ?, ?, ?, ?)`,
  ).run('q-1', '株式会社テスト', 'accepted', '2026-10-31T23:59:59.999+09:00', JSON.stringify(totals));

  console.log('----------------');
  console.log('Database initialized successfully.');
};

export function runInTransaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE'); // 書き込みロックを先に取る
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
