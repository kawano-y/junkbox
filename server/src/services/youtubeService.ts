import { google } from 'googleapis';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY,
});

export const fetchVideoComments = async (videoId: string) => {
  const response = await youtube.commentThreads.list({
    part: ['snippet'],
    videoId,
    maxResults: 20,
  });
  return response.data.items || [];
};
