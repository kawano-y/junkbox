import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Thread = { id: number; title: string; createdAt?: string };

export function ThreadListPage() {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    fetch('https://orange-parakeet-5rgq5g75pjh499-3000.app.github.dev/api/threads')
      .then((res) => res.json())
      .then((data) => setThreads(data));
  }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: '16px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>
        ← 機能一覧に戻る
      </Link>
      </div>
      {/* ヘッダー部分に「新規スレッド作成」ボタンを配置 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}></div>
      <h1>💬 スレッド一覧</h1>

      {/* /threads/new への遷移リンク */}
        <Link 
          to="/threads/new" 
          className="btn-primary"
          style={{ textDecoration: 'none', padding: '8px 16px', display: 'inline-block' }}
        >
          ＋ 新規スレッド作成
        </Link>
      {/* スレッド一覧表示 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {threads.map((thread) => (
          <div 
            key={thread.id} 
            style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}
          >
            <Link 
              to={`/threads/${thread.id}`} 
              style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}
            >
              {thread.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
