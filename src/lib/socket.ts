// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { API_URL } from './config';

// バックエンド（Express/Socket.io）の URL
const SOCKET_URL = API_URL;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // 画面描画時に明示的に connect() するため false に設定
});
