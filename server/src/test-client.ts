import { io } from 'socket.io-client';
import readline from 'readline';

const PORT = 3000;
const socket = io(`http://localhost:${PORT}`);

// 1. ターミナルからのキーボード入力を受け取るインターフェースを作成
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('socket.io サーバーに接続中...');

socket.on('connect', () => {
  console.log('✅ 接続成功! Socket ID:', socket.id);

  const roomId = 'room1';
  socket.emit('join_room', roomId);
  console.log(`[${roomId}] に入室しました。メッセージを入力して Enter を押してください。（Ctrl+C で終了）\n`);

  // 入力ループを開始
  promptInput();
});

// 2. 他の人（または別ターミナル）からのメッセージを受信したら表示
socket.on('receive_message', (data: {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
}) => {
  // 自分が送信したメッセージ以外、または受信ログとして表示
  console.log(`\n💬 [${data.userId}]: ${data.content}`);
  rl.prompt(); // 入力プロンプトを再表示
});

// 3. コンソールからの入力待ち処理
function promptInput() {
  rl.question('> ', (input) => {
    const text = input.trim();

    if (text) {
      // ソケットでメッセージ送信
      socket.emit('send_message', {
        roomId: 'room1',
        userId: 'test-user-001',
        content: text,
      });
    }

    // 次のメッセージ入力を待つ
    promptInput();
  });
}

socket.on('connect_error', (err) => {
  console.error('❌ 接続失敗:', err.message);
  process.exit(1);
});
