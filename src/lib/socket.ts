// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

// バックエンド（Express/Socket.io）の URL
const SOCKET_URL = 'https://orange-parakeet-5rgq5g75pjh499-3000.app.github.dev';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // 画面描画時に明示的に connect() するため false に設定
});
