// components/LogoutButton.tsx
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';

export const LogoutButton = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={handleLogout}>ログアウト</button>;
};
