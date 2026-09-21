import { db } from '../config/database';

export interface MessageRow {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const MessageModel = {
  // メッセージの保存
  create: (id: string, roomId: string, userId: string, content: string, createdAt: string) => {
    const stmt = db.prepare(`
      INSERT INTO messages (id, room_id, user_id, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(id, roomId, userId, content, createdAt);
  },

  // ルームごとのメッセージ履歴取得
  findByRoomId: (roomId: string, limit = 100): MessageRow[] => {
    const stmt = db.prepare(`
      SELECT id, room_id, user_id, content, created_at
      FROM messages
      WHERE room_id = ?
      ORDER BY created_at ASC
      LIMIT ?
    `);
    // node:sqlite の戻り値(Record<string, SQLOutputValue>)を MessageRow[] に型キャスト
    return stmt.all(roomId, limit) as unknown as MessageRow[];
  }
};
