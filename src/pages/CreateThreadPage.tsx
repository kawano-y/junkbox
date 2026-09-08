import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = 'https://orange-parakeet-5rgq5g75pjh499-3000.app.github.dev/api/threads';

export function CreateThreadPage() {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate(); // 画面遷移用のフック

  // スレッド作成処理
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error('スレッドの作成に失敗しました');

      const newThread = await res.json(); // 例: { id: 2, title: "..." }

      // 作成成功後、作成されたスレッドの詳細画面へ遷移
      navigate(`/threads/${newThread.id}`);
    } catch (err) {
      console.error('作成エラー:', err);
      alert('スレッドの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Link to="/" style={{ textDecoration: 'none', color: '#0066cc' }}>
        ← 一覧に戻る
      </Link>
      
      <h1 style={{ marginTop: '16px' }}>📝 新規スレッド作成</h1>

      <form onSubmit={handleCreateThread} className="post-form">
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            スレッドタイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: TypeScriptの勉強会について"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={!title.trim() || isSubmitting}
          style={{ marginTop: '16px' }}
        >
          {isSubmitting ? '作成中...' : 'スレッドを作成する'}
        </button>
      </form>
    </div>
  );
}
