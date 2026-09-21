import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db, initDb } from './config/database'; // 分割したファイルをインポート
import { threadRouter } from './routes/threadRouters';
import { youtubeRouter } from './routes/youtubeRoute';
import { roomRouter } from './routes/roomRoutes';
import { setupChatSocket } from './socket/chatSocket';

const app = express();
const PORT = 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// 起動時にDBテーブルを初期化
initDb();

// `/api/threads` 以下のリクエストを threadRoutes に委譲する
app.use('/api/threads', threadRouter);
app.use('/api/youtube', youtubeRouter);
app.use('/api/rooms', roomRouter);

// Socketハンドラー適用
setupChatSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
