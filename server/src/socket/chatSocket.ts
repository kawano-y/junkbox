import { Server, Socket } from 'socket.io';
import { MessageModel } from '../models/messageModel';
import { randomUUID } from 'crypto';

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
