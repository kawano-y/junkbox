import { Router, Request, Response } from 'express';
import { fetchVideoComments } from '../services/youtubeService';

export const youtubeRouter = Router();

youtubeRouter.get('/videos/:videoId/comments', async (req: Request<{ videoId: string }>, res: Response) => {
  try {
    const comments = await fetchVideoComments(req.params.videoId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'コメントの取得に失敗しました' });
  }
});
