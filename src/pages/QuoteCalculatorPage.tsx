import { useEffect, useState, type CSSProperties } from "react";
import { API_URL } from "../lib/config";

type Rounding = "floor" | "ceil" | "round";
type TaxRate = 8 | 10;

type QuoteLineInput = {
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: TaxRate;
};

type CalculatedLine = QuoteLineInput & { amount: number };

type CalculateResult = {
  lines: CalculatedLine[];
  taxSummaries: { taxRate: number; subtotal: number; tax: number }[];
  subtotal: number;
  tax: number;
  total: number;
};

type ErrorBody = {
  error?: string | { message?: string };
  message?: string;
};

const ROUNDINGS: { value: Rounding; label: string }[] = [
  { value: "floor", label: "切り捨て" },
  { value: "round", label: "四捨五入" },
  { value: "ceil", label: "切り上げ" },
];

const yen = (n: number) => `¥${Number(n).toLocaleString("ja-JP")}`;

const emptyLine = (): QuoteLineInput => ({ name: "", quantity: 1, unitPrice: 0, taxRate: 10 });

const errorMessage = (body: ErrorBody, status: number): string =>
  typeof body.error === "string"
    ? body.error
    : body.error?.message ?? body.message ?? `エラー (${status})`;

export function QuoteCalculatorPage() {
  const [lines, setLines] = useState<QuoteLineInput[]>([
    { name: "開発作業", quantity: 3, unitPrice: 33333, taxRate: 10 },
    { name: "書籍", quantity: 2, unitPrice: 1234, taxRate: 8 },
  ]);
  const [lineRounding, setLineRounding] = useState<Rounding>("floor");
  const [taxRounding, setTaxRounding] = useState<Rounding>("floor");
  const [result, setResult] = useState<CalculateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 追加する state
  const [saving, setSaving] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registeredId, setRegisteredId] = useState<string | number | null>(null);
  const [customerName, setCustomerName] = useState("");
  // 入力が変わるたびに、サーバーで計算し直す（金額計算はサーバー側だけで行う）
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/quotes/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines, lineRounding, taxRounding }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(errorMessage(data as ErrorBody, res.status));
          setResult(null);
        } else {
          setError(null);
          setResult(data as CalculateResult);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("サーバーに接続できません");
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [lines, lineRounding, taxRounding]);

  const update = <K extends keyof QuoteLineInput>(i: number, key: K, value: QuoteLineInput[K]) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));

  const num = (v: string) => (v === "" ? 0 : Number(v));

  const register = async () => {
    setSaving(true);
    setRegisterError(null);
    setRegisteredId(null);
    try {
      const res = await fetch(`${API_URL}/api/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 金額は送らない。サーバー側で再計算して保存する
        body: JSON.stringify({ customerName, lines, lineRounding, taxRounding }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(errorMessage(data as ErrorBody, res.status));
        return;
      }
      setRegisteredId((data as { id: string | number }).id);
    } catch {
      setRegisterError("サーバーに接続できません");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>見積の金額計算</h1>

      <div style={styles.options}>
        <label>
          明細の端数処理{" "}
          <select value={lineRounding} onChange={(e) => setLineRounding(e.target.value as Rounding)}>
            {ROUNDINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        <label>
          税額の端数処理{" "}
          <select value={taxRounding} onChange={(e) => setTaxRounding(e.target.value as Rounding)}>
            {ROUNDINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>品名</th>
            <th style={styles.thNum}>数量</th>
            <th style={styles.thNum}>単価</th>
            <th style={styles.thNum}>税率</th>
            <th style={styles.thNum}>金額</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td><input style={styles.input} value={l.name} onChange={(e) => update(i, "name", e.target.value)} /></td>
              <td><input style={styles.inputNum} type="number" min="0" value={l.quantity} onChange={(e) => update(i, "quantity", num(e.target.value))} /></td>
              <td><input style={styles.inputNum} type="number" min="0" value={l.unitPrice} onChange={(e) => update(i, "unitPrice", num(e.target.value))} /></td>
              <td>
                <select style={styles.inputNum} value={l.taxRate} onChange={(e) => update(i, "taxRate", Number(e.target.value) as TaxRate)}>
                  <option value={10}>10%</option>
                  <option value={8}>8%</option>
                </select>
              </td>
              <td style={styles.amount}>{result?.lines?.[i] ? yen(result.lines[i].amount) : "-"}</td>
              <td>
                <button onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))} aria-label={`${i + 1}行目を削除`}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setLines((ls) => [...ls, emptyLine()])}>明細を追加</button>

      {error && <p role="alert" style={styles.error}>{error}</p>}

      {result && (
        <section style={styles.summary} aria-label="計算結果">
          <dl style={styles.dl}>
            <dt>小計</dt><dd>{yen(result.subtotal)}</dd>
            {result.taxSummaries.map((t) => (
              <Row key={t.taxRate} label={`消費税 ${t.taxRate}%（対象 ${yen(t.subtotal)}）`} value={yen(t.tax)} />
            ))}
            <dt>消費税合計</dt><dd>{yen(result.tax)}</dd>
            <dt style={styles.total}>合計（税込）</dt><dd style={styles.total}>{yen(result.total)}</dd>
          </dl>
        </section>
      )}
      <label>
        顧客名{" "}
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </label>
      <button onClick={register} disabled={saving || lines.length === 0 || !!error}>
        {saving ? "登録中..." : "見積を登録"}
      </button>
      {registerError && <p role="alert" style={styles.error}>{registerError}</p>}
      {registeredId !== null && <p>見積を登録しました（ID: {registeredId}）</p>}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{ color: "#555" }}>{label}</dt>
      <dd style={{ color: "#555" }}>{value}</dd>
    </>
  );
}

const styles = {
  page: { maxWidth: 760, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, 'Hiragino Sans', 'Noto Sans JP', sans-serif", color: "#1f2933" },
  h1: { fontSize: 22, marginBottom: 16 },
  options: { display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" },
  table: { width: "100%", borderCollapse: "collapse", marginBottom: 12 },
  th: { textAlign: "left", padding: "6px 4px", borderBottom: "1px solid #cbd2d9" },
  thNum: { textAlign: "right", padding: "6px 4px", borderBottom: "1px solid #cbd2d9" },
  input: { width: "100%", padding: 6, boxSizing: "border-box" },
  inputNum: { width: 90, padding: 6, textAlign: "right", boxSizing: "border-box" },
  amount: { textAlign: "right", fontVariantNumeric: "tabular-nums", padding: "0 8px" },
  error: { color: "#b42318", marginTop: 16 },
  summary: { marginTop: 24, borderTop: "2px solid #1f2933", paddingTop: 12 },
  dl: { display: "grid", gridTemplateColumns: "1fr auto", rowGap: 6, columnGap: 24, margin: 0, fontVariantNumeric: "tabular-nums" },
  total: { fontSize: 20, fontWeight: 700, marginTop: 8 },
} satisfies Record<string, CSSProperties>;
