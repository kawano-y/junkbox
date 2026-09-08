import { Router } from 'express';
import {
  getThreads,
  createThread,
  getPostsByThread,
  createPost,
  getThreadById,
} from '../controllers/threadController';

export const threadRouter = Router();

// URLに対して、呼び出す Controller 関数を指定するだけ
threadRouter.get('/', getThreads);
threadRouter.post('/', createThread);
threadRouter.get('/:threadId', getThreadById);
threadRouter.get('/:threadId/posts', getPostsByThread);
threadRouter.post('/:threadId/posts', createPost);
