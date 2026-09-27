// routes/authRoutes.ts
import { Router } from 'express';
import { googleLogin, logout, me } from '../controllers/authController';

export const authRooters = Router();

authRooters.post('/google', googleLogin);
authRooters.post('/logout', logout); // 追加
authRooters.get('/me', me);
