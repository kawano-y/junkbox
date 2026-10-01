export type InvoiceItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceInput = {
  invoiceNo: string;
  issueDate: string;
  customerName: string;
  items: InvoiceItem[];
  note?: string;
};

export const MAX_INVOICE_ITEMS = 13;
