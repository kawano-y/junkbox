// src/types/chat.ts
export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
}
