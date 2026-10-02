import { useState } from "react";
import { OrderInvoices } from "./OrderInvoices";
import { QuoteConvert } from "./Quoteconvert";
import { QuoteCalculator } from "./QuoteCalculator";

const TABS = [
  { id: "quoteCalculator", label: "見積" },
  { id: "quoteConvert", label: "受注" },
  { id: "orderInvoices", label: "請求" },
] as const;

type TabId = (typeof TABS)[number]["id"];


export const TransactionPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("quoteCalculator");

  return (
    <div>
      <div role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 非表示にするだけ（アンマウントしない）ので入力中の内容が残る */}
      <div role="tabpanel" hidden={activeTab !== "quoteCalculator"}>
        <QuoteCalculator />
      </div>
      <div role="tabpanel" hidden={activeTab !== "quoteConvert"}>
        <QuoteConvert />
      </div>
      <div role="tabpanel" hidden={activeTab !== "orderInvoices"}>
        <OrderInvoices />
      </div>
    </div>
  );
}
