import type { User } from '../types/auth';

import { API_URL } from './config';

export const loginWithGoogle = async (idToken: string): Promise<User> => {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

    if (!res.ok) {
    const errBody = await res.json();
    console.error('サーバーからのエラー詳細:', errBody);
    throw new Error('Google login failed');
    }
  const data = await res.json();
  return data.user as User;
};

export const logout = async (): Promise<void> => {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Logout failed');
  }
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user as User;
};
