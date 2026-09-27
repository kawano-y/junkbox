import { ChatRoom } from '../components/ChatRoom';

export const ChatPage = () => {
  // URLパラメータやログインユーザー情報をここで取得して ChatRoom に渡す
  const roomId = 'room1';
  const userId = 'test-user-001';

  return (
    <div>
      <main>
        <ChatRoom roomId={roomId} userId={userId} />
      </main>
    </div>
  );
};
