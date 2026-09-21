import { Router } from 'express';
import { getRoomMessages } from '../controllers/messageController';

export const roomRouter = Router();

// GET /api/rooms/:roomId/messages
roomRouter.get('/:roomId/messages', getRoomMessages);
