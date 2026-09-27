import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../lib/auth';
import type { User } from '../types/auth';

console.log('CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

type Props = {
  onLogin: (user: User) => void;
};

export const LoginButton = ({ onLogin }: Props) => {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        if (!credentialResponse.credential) return;
        try {
          const user = await loginWithGoogle(credentialResponse.credential);
          onLogin(user);
        } catch (err) {
          console.error(err);
        }
      }}
      onError={() => console.error('Google login failed')}
    />
  );
};
