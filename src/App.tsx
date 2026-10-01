import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { ThreadListPage } from './pages/ThreadListPage';
import { ThreadDetailPage } from './pages/ThreadDetailPage';
import { CreateThreadPage } from './pages/CreateThreadPage';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';
import { InvoicePage } from './pages/InvoicePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/threads" element={<ThreadListPage />} />
          <Route path="/threads/new" element={<CreateThreadPage />} />
          <Route path="/threads/:threadId" element={<ThreadDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/invoice" element={<InvoicePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
