import { Request, Response } from 'express';
import { MessageModel } from '../models/messageModel';

export const getRoomMessages = (req: Request, res: Response) => {
  const roomIdParam = req.params.roomId;
  const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;

  if (!roomId) {
    return res.status(400).json({ error: 'roomId が指定されていません' });
  } 

  try {
    const messages = MessageModel.findByRoomId(roomId);
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'メッセージ履歴の取得に失敗しました' });
  }
};
