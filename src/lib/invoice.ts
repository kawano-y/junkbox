import { API_URL } from "./config"; // ← config.ts の実際のexport名に合わせる
import type { InvoiceInput } from "../types/invoice";

export async function downloadInvoice(input: InvoiceInput): Promise<void> {
  const res = await fetch(`${API_URL}/api/invoice/pdf`, { // ← 実際のパスに合わせる
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 認証がトークン方式ならここに Authorization を付ける
      // Authorization: `Bearer ${token}`,
    },
    // Cookie認証なら下を有効に
    // credentials: "include",
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`PDFの生成に失敗しました (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice_${input.issueDate}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
