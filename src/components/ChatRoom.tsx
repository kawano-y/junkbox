// src/components/ChatRoom.tsx
import React, { useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import type { Message } from '../types/chat';

interface ChatRoomProps {
  roomId: string;
  userId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, userId: initialUserId }) => {
  const [userId, setUserId] = useState<string>(initialUserId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);


  useEffect(() => {
    // 1. ソケット接続
    socket.connect();

    function onConnect() {
      setIsConnected(true);
      // ルームに入室
      socket.emit('join_room', roomId);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // 2. メッセージ受信イベントの購読
    function onReceiveMessage(newMessage: Message) {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }

    // イベントリスナーの登録
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);

    if (socket.connected) {
      onConnect();
    }

    // 3. クリーンアップ（コンポーネント破棄時にリスナー解除＆切断）
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
    };
  }, [roomId]);

  // メッセージ送信処理
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // バックエンドへメッセージ送信
    socket.emit('send_message', {
      roomId,
      userId,
      content: inputText.trim(),
    });

    setInputText('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>💬 ルーム: {roomId}</h2>
      <p style={{ color: isConnected ? 'green' : 'red', fontSize: '0.9rem' }}>
        ステータス: {isConnected ? '接続中 (オンライン)' : '切断中'} | ログインユーザー: {userId}
      </p>


      {/* 2. ユーザー名入力欄を追加 */}
      <div style={{ marginBottom: '16px', padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
          表示名 (ユーザーID):
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="名前を入力 (例: alice, bob)"
          style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
        />
      </div>

      {/* メッセージ表示エリア */}
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          height: '400px',
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          marginBottom: '16px',
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center' }}>メッセージはまだありません</p>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.userId === userId;
            return (
              <div
                key={msg.id || index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMine ? 'flex-end' : 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#666', marginBottom: '2px' }}>
                  {msg.userId}
                </span>
                <div
                  style={{
                    backgroundColor: isMine ? '#007bff' : '#e9ecef',
                    color: isMine ? '#fff' : '#000',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    maxWidth: '70%',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* メッセージ入力フォーム */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="メッセージを入力..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          type="submit"
          disabled={!isConnected}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          送信
        </button>
      </form>
    </div>
  );
};
