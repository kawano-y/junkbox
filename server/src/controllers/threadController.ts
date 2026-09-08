import { Request, Response } from 'express';
import { db } from '../config/database';

// 1. スレッド一覧取得
export const getThreads = (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT * FROM threads ORDER BY createdAt DESC');
    const threads = stmt.all();
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: 'スレッド一覧の取得に失敗しました' });
  }
};

// 2. スレッド新規作成
export const createThread = (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'タイトルは必須です' });
    }

    const stmt = db.prepare('INSERT INTO threads (title) VALUES (?)');
    const result = stmt.run(title);

    res.status(201).json({
      id: result.lastInsertRowid,
      title,
    });
  } catch (error) {
    res.status(500).json({ error: 'スレッドの作成に失敗しました' });
  }
};

// 2. スレッド詳細取得
export const getThreadById = (req: Request, res: Response) => {
  try {
    const threadId = Number(req.params.threadId);

    // 該当するスレッドを1件取得 (.get() を使用)
    const stmt = db.prepare('SELECT * FROM threads WHERE id = ?');
    const thread = stmt.get(threadId);

    // 指定されたIDのスレッドが存在しない場合
    if (!thread) {
      return res.status(404).json({ error: '指定されたスレッドが見つかりません' });
    }

    res.json(thread);
  } catch (error) {
    console.error('スレッド詳細取得エラー:', error);
    res.status(500).json({ error: 'スレッド詳細の取得に失敗しました' });
  }
};

// 3. 特定スレッドの投稿一覧取得
export const getPostsByThread = (req: Request, res: Response) => {
  try {
    const threadId = Number(req.params.threadId);
    const stmt = db.prepare('SELECT * FROM posts WHERE thread_id = ? ORDER BY createdAt ASC');
    const posts = stmt.all(threadId);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: '投稿の取得に失敗しました' });
  }
};

// 4. 特定スレッドへの新規投稿
export const createPost = (req: Request, res: Response) => {
  try {
    const threadId = Number(req.params.threadId);
    const { name, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: '投稿内容を入力してください' });
    }

    const userName = name && name.trim() !== '' ? name : '名無し';

    const stmt = db.prepare('INSERT INTO posts (thread_id, name, content) VALUES (?, ?, ?)');
    const result = stmt.run(threadId, userName, content);

    res.status(201).json({
      id: result.lastInsertRowid,
      thread_id: threadId,
      name: userName,
      content,
    });
  } catch (error) {
    res.status(500).json({ error: '投稿の作成に失敗しました' });
  }
};
