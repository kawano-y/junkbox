import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. SQLite データベースの初期化（dev.db ファイルが自動生成されます）
const db = new DatabaseSync('dev.db');

// 2. テーブルの作成（存在しない場合のみ）
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 投稿一覧の取得 API
app.get('/api/posts', (req, res) => {
  const stmt = db.prepare('SELECT * FROM posts ORDER BY id DESC');
  const posts = stmt.all();
  res.json(posts);
});

// 新規投稿の保存 API
app.post('/api/posts', (req, res) => {
  const { name, content } = req.body;
  const postName = name || '名無しさん';

  const stmt = db.prepare('INSERT INTO posts (name, content) VALUES (?, ?)');
  const result = stmt.run(postName, content);

  const newPost = {
    
    id: result.lastInsertRowid,
    name: postName,
    content,
    createdAt: new Date().toISOString(),
  };

  res.status(201).json(newPost);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
