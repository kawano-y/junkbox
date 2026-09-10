import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.warn('警告: YOUTUBE_API_KEY が設定されていません。');
}

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

export const fetchAllVideoComments = async (videoId: string) => {

  let allComments: any[] = [];
  let nextPageToken: string | undefined = undefined;

  // 1. コメントを全件取得
  do {
    const response: any = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: videoId,
      maxResults: 100,
      pageToken: nextPageToken,
      textFormat: 'plainText',
    });

    const items = response.data.items || [];
    allComments = allComments.concat(items);
    nextPageToken = response.data.nextPageToken;

  } while (nextPageToken);

  console.log(`合計 ${allComments.length} 件のコメントを取得しました。`);

  // 2. 💡 ファイルに保存する処理を追加
  try {
    // 保存先フォルダのパスを決める（server/data ディレクトリ）
    const outputDir = path.resolve(__dirname, '../../data');

    // フォルダが存在しない場合は作成
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 動画IDとタイムスタンプを含めたファイル名（例: comments_dQw4w9WgXcQ_1773175200000.json）
    const filePath = path.join(outputDir, `comments_${videoId}_${Date.now()}.json`);

    // JSON化してファイルに書き込み（インデント2で見やすく整形）
    fs.writeFileSync(filePath, JSON.stringify(allComments, null, 2), 'utf-8');
    console.log(`JSONファイルを保存しました: ${filePath}`);

  } catch (err) {
    console.error('ファイルの保存に失敗しました:', err);
  }

  return allComments;
};
