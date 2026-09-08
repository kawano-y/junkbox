import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThreadListPage } from './pages/ThreadListPage';
import { ThreadDetailPage } from './pages/ThreadDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ThreadListPage />} />
        <Route path="/threads/:threadId" element={<ThreadDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
