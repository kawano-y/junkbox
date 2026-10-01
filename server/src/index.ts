import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db, initDb } from './config/database'; // 分割したファイルをインポート
import { threadRouter } from './routes/threadRouters';
import { youtubeRouter } from './routes/youtubeRoute';
import { roomRouter } from './routes/roomRoutes';
import { setupChatSocket } from './socket/chatSocket';
import { authRooters } from './routes/authRoutes';
import { invoiceRouter } from './routes/invoiceRoutes'; // ← 追加
import quoteRoutes from './routes/quoteRoutes';

const app = express();
const PORT = 3000;
const httpServer = createServer(app);
const FRONTEND_ORIGIN = 'https://orange-parakeet-5rgq5g75pjh499-5173.app.github.dev';

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN,
    credentials: true,
  },
});
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use(express.json());

// 起動時にDBテーブルを初期化
initDb();

// `/api/threads` 以下のリクエストを threadRoutes に委譲する
app.use('/api/threads', threadRouter);
app.use('/api/youtube', youtubeRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/invoice', invoiceRouter);


app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 本番はHTTPS前提
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7日
    },
  })
);
app.use('/api/auth', authRooters);
app.use('/api/quotes', quoteRoutes);


// Socketハンドラー適用
setupChatSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
