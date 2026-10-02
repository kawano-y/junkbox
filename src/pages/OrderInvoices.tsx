import { useEffect, useState, type CSSProperties, type FormEvent } from "react";

type Invoice = {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  issuedAt: string;
};

type InvoiceList = {
  invoices: Invoice[];
  orderTotal: number;
  invoicedTotal: number;
  remaining: number;
};

type ApiError = {
  error?: string;
  code?: "INVALID_AMOUNT" | "EXCEEDS_ORDER_TOTAL";
};

const yen = (n: number) => `¥${Number(n).toLocaleString("ja-JP")}`;
const STATUS_LABELS: Record<string, string> = { issued: "発行済み" };

type Props = {
  initialOrderId?: string;
};

export function OrderInvoices({ initialOrderId }: Props) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId ?? "");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [data, setData] = useState<InvoiceList | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/orders/${encodeURIComponent(id)}/invoices`);
      const body: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        setData(null);
        setOrderId(null);
        setError(res.status === 404 ? "受注が見つかりません" : (body as ApiError).error ?? `エラー (${res.status})`);
        return;
      }
      setData(body as InvoiceList);
      setOrderId(id);
    } catch {
      setError("サーバーに接続できません");
    } finally {
      setLoading(false);
    }
  };

  // 受注変換画面から受注IDを受け取ったときは、そのまま表示する
  useEffect(() => {
    if (initialOrderId) void load(initialOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

  const create = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orderId || !data) return;
    setError(null);
    try {
      const res = await fetch(`/orders/${encodeURIComponent(orderId)}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const body = (await res.json().catch(() => ({}))) as ApiError;
      if (res.status === 201) {
        setAmount("");
        await load(orderId); // 一覧と残額はサーバーの値を取り直す
        return;
      }
      if (body.code === "INVALID_AMOUNT") setError("金額は1円以上の整数で入力してください");
      else if (body.code === "EXCEEDS_ORDER_TOTAL")
        setError(`請求合計が受注金額を超えます。あと ${yen(data.remaining)} まで請求できます`);
      else if (res.status === 404) setError("受注が見つかりません");
      else setError(body.error ?? `エラー (${res.status})`);
    } catch {
      setError("サーバーに接続できません");
    }
  };

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>請求</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (orderIdInput.trim()) void load(orderIdInput.trim());
        }}
        style={styles.row}
      >
        <label>
          受注ID{" "}
          <input value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)} style={styles.input} />
        </label>
        <button type="submit" disabled={loading}>請求を表示</button>
      </form>

      {error && <p role="alert" style={styles.error}>{error}</p>}

      {data && (
        <>
          <dl style={styles.dl}>
            <dt>受注金額</dt><dd>{yen(data.orderTotal)}</dd>
            <dt>請求済み</dt><dd>{yen(data.invoicedTotal)}</dd>
            <dt style={styles.strong}>残額</dt><dd style={styles.strong}>{yen(data.remaining)}</dd>
          </dl>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>請求ID</th>
                <th style={styles.thNum}>金額</th>
                <th style={styles.th}>状態</th>
                <th style={styles.th}>発行日時</th>
              </tr>
            </thead>
            <tbody>
              {data.invoices.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 12, color: "#555" }}>まだ請求がありません。下のフォームから作成できます。</td></tr>
              )}
              {data.invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={styles.td}>{inv.id}</td>
                  <td style={styles.tdNum}>{yen(inv.amount)}</td>
                  <td style={styles.td}>{STATUS_LABELS[inv.status] ?? inv.status}</td>
                  <td style={styles.td}>{new Date(inv.issuedAt).toLocaleString("ja-JP")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={create} style={styles.row}>
            <label>
              請求金額{" "}
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ ...styles.input, textAlign: "right", width: 140 }}
              />
            </label>
            <button type="button" onClick={() => setAmount(String(data.remaining))} disabled={data.remaining <= 0}>
              残額を入力
            </button>
            <button type="submit">請求を作成</button>
          </form>
        </>
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
  dl: { display: "grid", gridTemplateColumns: "auto auto", justifyContent: "start", columnGap: 32, rowGap: 6, fontVariantNumeric: "tabular-nums" },
  strong: { fontWeight: 700, fontSize: 18 },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 16 },
  th: { textAlign: "left", padding: "6px 4px", borderBottom: "1px solid #cbd2d9" },
  thNum: { textAlign: "right", padding: "6px 4px", borderBottom: "1px solid #cbd2d9" },
  td: { padding: "6px 4px", borderBottom: "1px solid #e4e7eb" },
  tdNum: { padding: "6px 4px", borderBottom: "1px solid #e4e7eb", textAlign: "right", fontVariantNumeric: "tabular-nums" },
} satisfies Record<string, CSSProperties>;
