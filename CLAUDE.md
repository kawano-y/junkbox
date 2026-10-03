# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 構成

2つの独立した npm パッケージで構成される（ワークスペースではないため、`npm install` はそれぞれで実行する）。

- ルート: フロントエンド（React 19 + Vite + TypeScript, react-router-dom）
- `server/`: バックエンド（Express 5 + Socket.IO + `node:sqlite`, tsx で実行, CommonJS）

## コマンド

フロントエンド（リポジトリ直下）:

```bash
npm run dev      # Vite 開発サーバー (5173)
npm run build    # tsc -b && vite build（型チェック込み）
npm run lint     # eslint
```

バックエンド（`server/` で実行）:

```bash
npm run dev                                  # tsx watch src/index.ts (ポート 3000)
npm test                                     # vitest run
npx vitest run src/domain/quote.test.ts      # 単一ファイル
npx vitest run -t "期限切れは変換できない"     # テスト名で絞り込み
```

## 実行環境・設定

- GitHub Codespaces 前提。フロントの API 接続先はルートの `.env` の `VITE_API_URL`（`src/lib/config.ts` の `API_URL` 経由で参照し、ページで URL を直書きしない）。サーバーの CORS 許可 `server/src/index.ts` の `FRONTEND_ORIGIN` は Codespaces の URL でハードコードされているので、環境が変わったら直す。
- 環境変数: サーバーは `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `YOUTUBE_API_KEY`（`server/.env`）。フロントは `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`（ルートの `.env`、`.env.example` 参照）。
- DB は `node:sqlite` の `DatabaseSync('dev.db')`（`server/` 直下に作られる）。スキーマはマイグレーションではなく、起動時の `initDb()`（`server/src/config/database.ts`）で `CREATE TABLE IF NOT EXISTS` とシードデータ投入（`test-user-001`, `room1`, 見積 `q-1`）を行う。テーブル変更は既存の `dev.db` を削除しないと反映されない。
- `server/prisma-next.md`, `server/migrations/`, `server/.claude/skills/prisma-composer` などの Prisma Next / PostgreSQL 関連ファイルがあるが、現状のアプリコードは Prisma を使っていない（`prisma` も依存関係に入っていない）。
- 請求書 PDF は Playwright の Chromium で HTML→PDF 変換する（`server/src/pdf/`）。ブラウザのインストール（`npx playwright install chromium`）が必要。

## バックエンドのアーキテクチャ

レイヤー: `routes/` → `controllers/` → `services/` → `domain/`

- **`domain/`**: DB や Express に依存しない純粋関数。業務ルールはここに置き、ユニットテスト（`*.test.ts`）もここにある。現在時刻や ID 生成は引数で受け取る（`now: Date`, `newId`）ことでテスト可能にしている。
- **`services/`**: DB 読み書きとドメイン関数の組み合わせ。整合性が必要な処理は `runInTransaction()`（`BEGIN IMMEDIATE`）の中で「読み込み→ドメインのチェック→書き込み」を行う。
- **`controllers/`**: ドメインのエラークラスを HTTP ステータスに変換する（例: `QuoteConversionError` の `EXPIRED`→422, `INVALID_STATUS`→409, `NotFoundError`→404）。

### 見積→受注→請求のフロー

- **金額**は円の整数で扱う。`calculateQuote`（`domain/quote.ts`）は「行金額を端数処理 → 税率（10%/8%）ごとに小計 → 税額は税率ごとに1回だけ端数処理」の順で計算する。端数処理モード（floor/ceil/round）は行と税で別々に指定できる。
- **見積**の状態は `draft | sent | accepted | rejected | ordered`。有効期限は JST の日末（`endOfDayJst`）で、期限ちょうどはまだ有効。
- **受注への変換**は `accepted` かつ期限内の見積だけが可能。受注は見積の `totals` をそのまま引き継ぎ（再計算しない）、見積は `ordered` になる。`orders.quote_id` は UNIQUE。
- **請求**は受注に対して分割発行でき、`issued` の請求の合計が受注の税込合計を超えないようにする（`domain/invoice.ts`）。
- 見積・受注の金額は `totals_json` 列に `QuoteTotals` を JSON 文字列として保存している。

### その他の機能

スレッド掲示板（`/api/threads`）、Socket.IO チャット（`socket/chatSocket.ts`, `/api/rooms`）、Google ログイン（`/api/auth`, express-session）、YouTube 検索（`/api/youtube`）。

注意: `server/src/index.ts` では `express-session` ミドルウェアが `/api/threads`〜`/api/orders` のルーター登録より**後**に登録されているため、セッションが使えるのは `/api/auth` と `/api/quotes` だけ。

## フロントエンド

- ルーティングは `src/App.tsx` に集約。ページは `src/pages/*Page.tsx`（コンポーネント名も `XxxPage`）。
- 認証状態は `contexts/AuthContext.tsx`、API 呼び出しや Socket 接続は `src/lib/` に置く。
