import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

type Post = {
  id: number;
  name: string;
  content: string;
  createdAt: string;
};

// サーバー上のメモリで保持する仮データ
let posts: Post[] = [
  {
    id: 1,
    name: '管理者',
    content: 'TypeScriptバックエンドからの初期データです！',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

// 1. 投稿一覧取得 API (GET)
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// 2. 投稿追加 API (POST)
app.post('/api/posts', (req, res) => {
  const { name, content } = req.body;
  const newPost: Post = {
    id: Date.now(),
    name: name || '名無しさん',
    content,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  posts.unshift(newPost);
  res.status(201).json(newPost);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
