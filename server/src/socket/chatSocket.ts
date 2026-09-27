import { Server, Socket } from 'socket.io';
import { MessageModel } from '../models/messageModel';
import { randomUUID } from 'crypto';
import { db } from '../config/database';

export function setupChatSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    // 接続された瞬間にターミナルに出力
    console.log(`[Socket.io] クライアントが接続しました | ID: ${socket.id}`);

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`[Socket.io] Socket ${socket.id} が ルーム:${roomId} に入室`);
    });

    socket.on('send_message', (data: { roomId: string; userId: string; content: string }) => {
      console.log(`[Socket.io] メッセージを受信＆配信中... from: ${socket.id}`);
      const { roomId, userId, content } = data;
      if (!roomId || !userId || !content.trim()) return;

      // 1. users テーブルにユーザーが存在するか確認
      const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);

      // 2. 存在しなければ自動登録（UPSERT / 既存チェック後 INSERT）
      if (!existingUser) {
        // NOT NULL 制約を満たすように username, email, password_hash に値を設定して INSERT
        db.prepare(`
          INSERT INTO users (id, username, email, password_hash, created_at)
          VALUES (?, ?, ?, ?, DATETIME('now'))
        `).run(
          userId,                         // id
          userId,                         // username
          `${userId}@guest.local`,        // email (UNIQUE 制約を回避するため動的に作成)
          'guest_dummy_hash'              // password_hash (仮パスワードハッシュ)
        );

        console.log(`👤 新規ユーザーを自動登録しました: ${userId}`);
      }

      const messageId = randomUUID();
      const createdAt = new Date().toISOString();

      try {
        // Model を使って DB に保存
        MessageModel.create(messageId, roomId, userId, content, createdAt);

        // ルーム全体へ配信
        io.to(roomId).emit('receive_message', {
          id: messageId,
          roomId,
          userId,
          content,
          createdAt,
        });
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    socket.on('disconnect', (reason) => {
        // 切断されたときに出力
        console.log(`[Socket.io] クライアントが切断しました | ID: ${socket.id} (理由: ${reason})`);
    });
  });
}
