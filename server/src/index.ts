import express from 'express';
import cors from 'cors';
import { db, initDb } from './config/database'; // 分割したファイルをインポート
import { threadRouter } from './routes/threadRouters';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 起動時にDBテーブルを初期化
initDb();

// `/api/threads` 以下のリクエストを threadRoutes に委譲する
app.use('/api/threads', threadRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
