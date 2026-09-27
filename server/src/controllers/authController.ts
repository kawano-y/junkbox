// controllers/authController.ts
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { upsertGoogleUser, type User } from '../models/userModel';
import { db } from '../config/database';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ error: 'invalid token' });
    }

    const user = upsertGoogleUser({
      email: payload.email,
      sub: payload.sub!,
      name: payload.name,
      picture: payload.picture,
    });

    req.session.userId = user.id;
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'authentication failed' });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'logout failed' });
    }
    res.clearCookie('connect.sid'); // express-sessionのデフォルトCookie名
    res.json({ success: true });
  });
};

export const me = (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'not logged in' });
  }
  const user = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(req.session.userId) as User | undefined;

  if (!user) {
    return res.status(401).json({ error: 'not logged in' });
  }
  res.json({ user });
};
