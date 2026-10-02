import { useState, type CSSProperties, type FormEvent } from "react";

// 受注JSON。lines と totals の中身は仮の型なので、実際のレスポンスに合わせて直してください
type OrderLine = { name: string; quantity: number; unitPrice: number; amount?: number };
type Order = {
  id: string;
  quoteId: string;
  customerName: string;
  lines: OrderLine[];
  totals: { subtotal?: number; tax?: number; total: number };
  orderedAt: string;
};

type ApiError = {
  code?: "INVALID_STATUS" | "EXPIRED";
  message?: string;
};

type Props = {
  onOpenInvoices?: (orderId: string) => void;
};

const yen = (n: number) => `¥${Number(n).toLocaleString("ja-JP")}`;

export function QuoteConvert({ onOpenInvoices }: Props) {
  const [quoteId, setQuoteId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const convert = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = quoteId.trim();
    if (!id) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(`/quotes/${encodeURIComponent(id)}/convert`, { method: "POST" });
      const body: unknown = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setOrder(body as Order);
        return;
      }
      const err = body as ApiError;
      if (err.code === "INVALID_STATUS")
        setError("この見積は受注に変換できません。承認済みの見積だけが対象です（下書き・送付済み・却下・変換済みは不可）");
      else if (err.code === "EXPIRED") setError("見積の有効期限が切れているため、受注に変換できません");
      else if (res.status === 404) setError("見積が見つかりません。IDを確認してください");
      else setError(err.message ?? `エラー (${res.status})`);
    } catch {
      setError("サーバーに接続できません");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>受注に変換</h1>

      <form onSubmit={convert} style={styles.row}>
        <label>
          見積ID{" "}
          <input value={quoteId} onChange={(e) => setQuoteId(e.target.value)} style={styles.input} />
        </label>
        <button type="submit" disabled={loading || quoteId.trim() === ""}>受注に変換</button>
      </form>

      {error && <p role="alert" style={styles.error}>{error}</p>}

      {order && (
        <section aria-label="変換結果">
          <p style={styles.success}>受注に変換しました。</p>
          <dl style={styles.dl}>
            <dt>受注ID</dt><dd>{order.id}</dd>
            <dt>見積ID</dt><dd>{order.quoteId}</dd>
            <dt>顧客名</dt><dd>{order.customerName}</dd>
            <dt>受注日時</dt><dd>{new Date(order.orderedAt).toLocaleString("ja-JP")}</dd>
            <dt style={styles.strong}>受注金額（税込）</dt>
            <dd style={styles.strong}>{yen(order.totals.total)}</dd>
          </dl>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>品名</th>
                <th style={styles.thNum}>数量</th>
                <th style={styles.thNum}>単価</th>
                <th style={styles.thNum}>金額</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((l, i) => (
                <tr key={i}>
                  <td style={styles.td}>{l.name}</td>
                  <td style={styles.tdNum}>{l.quantity}</td>
                  <td style={styles.tdNum}>{yen(l.unitPrice)}</td>
                  <td style={styles.tdNum}>{l.amount != null ? yen(l.amount) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {onOpenInvoices && (
            <button style={{ marginTop: 16 }} onClick={() => onOpenInvoices(order.id)}>
              この受注の請求へ進む
            </button>
          )}
        </section>
      )}
    </main>
  );
}

const styles = {
  page: { maxWidth: 760, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, 'Hiragino Sans', 'Noto Sans JP', sans-serif", color: "#1f2933" },
  h1: { fontSize: 22, marginBottom: 16 },
  row: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "16px 0" },
  input: { padding: 6, boxSizing: "border-box" },
  error: { color: "#b42318" },
  success: { color: "#1b6e3c", fontWeight: 600 },
  dl: { display: "grid", gridTemplateColumns: "auto 1fr", justifyContent: "start", columnGap: 32, rowGap: 6, fontVariantNumeric: "tabular-nums" },
  strong: { fontWeight: 700, fontSize: 18 },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 16 },
  th: { textAlign: "left", padding: "6px 4px", borderBottom: "1px solid #cbd2d9" },
  thNum: { textAlign: "right", padding: "6px 4px", borderBottom: "1px solid #cbd2d9" },
  td: { padding: "6px 4px", borderBottom: "1px solid #e4e7eb" },
  tdNum: { padding: "6px 4px", borderBottom: "1px solid #e4e7eb", textAlign: "right", fontVariantNumeric: "tabular-nums" },
} satisfies Record<string, CSSProperties>;
