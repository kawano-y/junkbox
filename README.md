# junkbox

Webアプリでよく使われる仕組みを、ひとつのアプリの中で実際に実装して試すためのポートフォリオ用プロジェクトです。
掲示板やリアルタイムチャットのような基本的な機能から、見積・受注・請求のような業務システムのロジックまでを扱っています。

## 実装している機能

| 機能 | 画面 | 主な仕組み |
|---|---|---|
| スレッド掲示板 | `/threads` | REST API による CRUD、SQLite |
| リアルタイムチャット | `/chat` | Socket.IO のルーム機能、メッセージの永続化 |
| Google ログイン | `/login` | Google OAuth（IDトークン検証）、express-session |
| 見積計算・登録 | `/quotes` | 消費税の端数処理、税率ごとの集計 |
| 見積→受注の変換 | `/quotesconvert` | 状態と有効期限のチェック、トランザクション |
| 受注→請求（分割請求） | `/orders` | 請求合計が受注金額を超えないための排他制御 |
| 請求書 PDF 出力 | `/invoice` | Playwright（Chromium）による HTML→PDF 変換 |
| YouTube コメント取得 | API のみ | YouTube Data API、ページングによる全件取得と JSONL 保存 |

## 実装のポイント

### 見積・受注・請求

業務ルールを `server/src/domain/` に純粋関数としてまとめ、DB や Express から切り離しています。現在時刻や ID 生成は引数で受け取るので、日付に依存するルールも Vitest でテストできます。

- **消費税計算**: 金額は円の整数で扱います。行ごとに端数処理したあと税率（10% / 8%）ごとに小計を出し、税額は税率ごとに1回だけ端数処理します（インボイス制度の考え方に合わせています）。端数処理の方法（切り捨て / 切り上げ / 四捨五入）は行と税で別々に選べます。
- **見積→受注**: 受注に変換できるのは「承認済み」かつ有効期限内（JST の日末まで）の見積だけです。受注は見積の金額をそのまま引き継ぎ、再計算はしません。
- **分割請求**: 1つの受注に対して何回かに分けて請求できますが、請求合計が受注金額を超えないようにしています。SQLite の `BEGIN IMMEDIATE` で書き込みロックを先に取り、「残額の確認→請求の登録」をひとつのトランザクションで行うことで、同時に請求されても超過しないようにしています。
- **エラーの扱い**: ドメインのエラーにはコードを持たせ、コントローラーで HTTP ステータスに変換しています（期限切れ→422、状態不正→409 など）。

### レイヤー構成（バックエンド）

```
routes/ → controllers/ → services/ → domain/
         (HTTP の入出力)  (DB アクセス)  (業務ルール)
```

## 技術スタック

- **フロントエンド**: React 19 / TypeScript / Vite / React Router / Socket.IO Client / @react-oauth/google
- **バックエンド**: Node.js / Express 5 / Socket.IO / node:sqlite / express-session / google-auth-library / googleapis / Playwright
- **テスト**: Vitest
- **開発環境**: GitHub Codespaces

## セットアップ

フロントエンドとバックエンドは別々の npm パッケージなので、それぞれで依存関係をインストールします。

```bash
npm install
```

```bash
cd server && npm install && npx playwright install chromium
```

### 環境変数

`server/.env`:

```env
SESSION_SECRET=任意の文字列
GOOGLE_CLIENT_ID=GoogleのOAuthクライアントID
YOUTUBE_API_KEY=YouTube Data APIのキー
```

フロントエンド（リポジトリ直下の `.env`）:

```env
VITE_GOOGLE_CLIENT_ID=GoogleのOAuthクライアントID
```

API の接続先（`src/lib/config.ts` の `API_URL`）と、サーバーで許可する CORS のオリジン（`server/src/index.ts` の `FRONTEND_ORIGIN`）は Codespaces の URL になっています。別の環境で動かすときはこの2か所を書き換えてください。

### 起動

```bash
cd server && npm run dev
```

```bash
npm run dev
```

バックエンドはポート 3000、フロントエンドはポート 5173 で起動します。DB（`server/dev.db`）は起動時に自動で作られ、テスト用のデータ（ユーザー、チャットルーム、承認済みの見積 `q-1`）が入ります。

### テスト

```bash
cd server && npm test
```

## 主な API

| メソッド | パス | 内容 |
|---|---|---|
| GET / POST | `/api/threads` | スレッド一覧 / 作成 |
| GET / POST | `/api/threads/:threadId/posts` | 投稿一覧 / 投稿 |
| GET | `/api/rooms/:roomId/messages` | チャット履歴 |
| POST | `/api/auth/google` | Google ログイン |
| POST | `/api/quotes/calculate` | 見積金額の計算 |
| POST | `/api/quotes` | 見積の登録 |
| POST | `/api/quotes/:id/convert` | 見積→受注の変換 |
| GET / POST | `/api/orders/:id/invoices` | 受注に対する請求の一覧 / 発行 |
| POST | `/api/invoice/pdf` | 請求書 PDF の生成 |
| GET | `/api/youtube/videos/:videoId/comments` | YouTube コメント取得 |
