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
      <h1>💬 スレッド一覧</h1>
      <ul>
        {threads.map((thread) => (
          <li key={thread.id}>
            {/* 詳細画面へのリンク */}
            <Link to={`/threads/${thread.id}`}>{thread.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
