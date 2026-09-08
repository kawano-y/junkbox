import { useState, useEffect } from 'react';
import './App.css';

// 1. 投稿データの型定義
type Post = {
  id: number;
  name: string;
  content: string;
  createdAt: string;
}
// 1. スレッド情報の型定義
type Thread = {
  id: number;
  title: string;
  createdAt?: string;
};
// 対象のスレッドID（URLパラメータやprops等から取得するイメージです）
const THREAD_ID = 1;
const API_BASE_URL = `https://orange-parakeet-5rgq5g75pjh499-3000.app.github.dev/api/threads/${THREAD_ID}`;

export default function App() {// スレッド情報のState
  const [thread, setThread] = useState<Thread | null>(null);
  // 2. State（状態管理）の設定
  const [posts, setPosts] = useState<Post[]>([]);
  // フォーム入力用のState
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  // ローディングとエラー状態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. 初回表示時にバックエンド API (GET) からデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // スレッド情報と投稿一覧を並行取得 (Promise.all)
        const [threadRes, postsRes] = await Promise.all([
          fetch(API_BASE_URL),
          fetch(`${API_BASE_URL}/posts`)
        ]);

        if (!threadRes.ok || !postsRes.ok) {
          throw new Error('データの取得に失敗しました');
        }

        const threadData: Thread = await threadRes.json();
        const postsData: Post[] = await postsRes.json();

        setThread(threadData);
        setPosts(postsData);
      } catch (err) {
        console.error(err);
        setError('スレッドデータの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // 2. 投稿送信処理 (POST)
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await fetch('https://orange-parakeet-5rgq5g75pjh499-3000.app.github.dev/api/threads/1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content }),
      });

      if (res.ok) {
        const newPost = await res.json();
        setPosts([newPost, ...posts]); // 画面の表示も更新
        setContent('');
      }
    } catch (err) {
      console.error('投稿エラー:', err);
    }
  };

  // 4. 削除処理
  const handleDeletePost = (id: number) => {
    setPosts(posts.filter((post) => post.id !== id));
  };

  if (loading) return <div className="container"><p>読み込み中...</p></div>;
  if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="container">
      <h1>💬 {thread ? thread.title : 'スレッド詳細'}</h1>

      {/* 投稿フォーム */}
      <form
        onSubmit={handleAddPost}
        className="post-form"
      >
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>お名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 山田太郎"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>メッセージ</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="メッセージを入力してください"
            rows={3}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" className="btn-primary">
          投稿する
        </button>
      </form>

      {/* 投稿一覧 */}
      <h2>投稿一覧 ({posts.length}件)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              padding: '12px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              background: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>
                <strong>👤 {post.name}</strong>{' '}
                <small style={{ color: '#666', marginLeft: '8px' }}>🕒 {post.createdAt}</small>
              </span>
              <button
                onClick={() => handleDeletePost(post.id)}
                style={{
                  background: '#ff4d4f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                削除
              </button>
            </div>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
