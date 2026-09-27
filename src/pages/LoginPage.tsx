// pages/LoginPage.tsx
import { useNavigate } from 'react-router-dom';
import { LoginButton } from '../components/LoginButton';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types/auth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = (user: User) => {
    setUser(user);
    navigate('/');
  };

  return (
    <div>
      <h1>ログイン</h1>
      <LoginButton onLogin={handleLogin} />
    </div>
  );
};
