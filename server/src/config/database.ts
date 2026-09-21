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
  // ユーザーテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
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


  const userCheck = db.prepare('SELECT * FROM users WHERE id = ?').get('test-user-001');
const roomCheck = db.prepare('SELECT * FROM rooms WHERE id = ?').get('room1');

  console.log('--- DB Check ---');
  console.log('User in DB:', userCheck);
  console.log('Room in DB:', roomCheck);
  console.log('----------------');
  console.log('Database initialized successfully.');
};
