import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ThreadListPage } from './pages/ThreadListPage';
import { ThreadDetailPage } from './pages/ThreadDetailPage';
import { CreateThreadPage } from './pages/CreateThreadPage'; // 追加
import { ChatPage } from './pages/ChatPage'; // 追加

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 大元の機能一覧画面 */}
        <Route path="/" element={<HomePage />} />

        {/* 2. 掲示板機能の各画面 */}
        <Route path="/" element={<ThreadListPage />} />
        <Route path="/threads" element={<ThreadListPage />} />
        <Route path="/threads/new" element={<CreateThreadPage />} />
        <Route path="/threads/:threadId" element={<ThreadDetailPage />} />
        {/* 3. リアルタイムチャット画面を追加する場合 */}
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}
