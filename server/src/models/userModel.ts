// models/userModel.ts
import { db } from '../config/database'; // 実際のexport名に合わせてください
import { randomUUID } from 'crypto';

export type User = {
  id: string;
  username: string | null;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  name: string | null;
  picture: string | null;
};

export const findUserByEmail = (email: string): User | undefined => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
};

export const upsertGoogleUser = (payload: {
  email: string;
  sub: string;
  name?: string;
  picture?: string;
}): User => {
  const existing = findUserByEmail(payload.email);
  const name = payload.name ?? null;
  const picture = payload.picture ?? null;

  if (existing) {
    db.prepare(
      'UPDATE users SET google_id = ?, name = ?, picture = ? WHERE id = ?'
    ).run(payload.sub, name, picture, existing.id);
    return { ...existing, google_id: payload.sub, name, picture };
  }

  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, email, google_id, name, picture) VALUES (?, ?, ?, ?, ?)`
  ).run(id, payload.email, payload.sub, name, picture);

  return {
    id,
    username: null,
    email: payload.email,
    password_hash: null,
    google_id: payload.sub,
    name,
    picture,
  };
};
