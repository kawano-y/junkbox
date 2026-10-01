import { useState } from "react";
import "./InvoicePage.css"; // ← 追加
import { downloadInvoice } from "../lib/invoice";
import {
  MAX_INVOICE_ITEMS,
  type InvoiceInput,
  type InvoiceItem,
} from "../types/invoice";

const emptyItem = (): InvoiceItem => ({ name: "", quantity: 1, unitPrice: 0 });

export const InvoicePage = () => {
  const [customerName, setCustomerName] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [note, setNote] = useState("");

  const updateItem = <K extends keyof InvoiceItem>(
    index: number,
    key: K,
    value: InvoiceItem[K],
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  };

  const addItem = () => {
    if (items.length >= MAX_INVOICE_ITEMS) return;
    setItems((prev) => [...prev, emptyItem()]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 名前が空の行は送らない（13行への空埋めはサーバー側）
    const validItems = items.filter((i) => i.name.trim() !== "");
    if (!customerName.trim()) return setError("請求先を入力してください");
    if (validItems.length === 0) return setError("明細を1行以上入力してください");

    const input: InvoiceInput = { invoiceNo, issueDate, customerName, items: validItems, note };

    setLoading(true);
    try {
      await downloadInvoice(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーです");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="invoice-page">
      <h1>請求書作成</h1>
      <div className="invoice-form">
      <label className="field">
          <span>請求先</span>
          <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="株式会社〇〇 御中"
          />
      </label>
      <label className="field">
          <span>請求日</span>
          <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          />
      </label>
      <label className="field">
          <span>請求番号</span>
          <input
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.target.value)}
          placeholder="INV-2026-0001"
          />
      </label>
      <label className="field field-wide">
          <span>備考</span>
          <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          />
      </label>
      </div>

      <h2>明細（{items.length} / {MAX_INVOICE_ITEMS}）</h2>
        {items.map((item, i) => (
        <div key={i} className="item-row">
            <input
            placeholder="品名"
            aria-label="品名"
            value={item.name}
            onChange={(e) => updateItem(i, "name", e.target.value)}
            />
            <input
            type="number"
            min={1}
            placeholder="数量"
            aria-label="数量"
            value={item.quantity}
            onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
            />
            <input
            type="number"
            min={0}
            placeholder="単価"
            aria-label="単価"
            value={item.unitPrice}
            onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
            />
            <button type="button" onClick={() => removeItem(i)}>
            削除
            </button>
        </div>
        ))}
      <button
        type="button"
        onClick={addItem}
        disabled={items.length >= MAX_INVOICE_ITEMS}
      >
        行を追加
      </button>

      <p className="total">小計: {total.toLocaleString()} 円</p>

      {error && <p role="alert">{error}</p>}

      <div className="actions">
        <button type="submit" disabled={loading}>
            {loading ? "生成中..." : "PDFをダウンロード"}
        </button>
      </div>
    </form>
  );
}
