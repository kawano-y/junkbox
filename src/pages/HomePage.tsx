import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>🚀 アプリ機能一覧</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>利用したい機能を選択してください。</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* 掲示板機能へのカード */}
        <div 
          style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            padding: '20px', 
            background: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>💬 スレッド掲示板</h2>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px' }}>
            テーマごとのスレッドでユーザー同士がメッセージを投稿・閲覧できます。
          </p>
          <Link 
            to="/threads" 
            className="btn-primary" 
            style={{ textDecoration: 'none', display: 'inline-block', padding: '8px 16px' }}
          >
            掲示板を開く →
          </Link>
        </div>

        {/* ※ 将来新しい機能を追加する際は、ここに別のカードを並べられます */}
      </div>
    </div>
  );
}
