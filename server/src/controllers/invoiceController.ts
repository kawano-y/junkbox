import type { Request, Response, NextFunction  } from 'express'
import { z } from 'zod'
import { MAX_ROWS, createInvoicePdf } from '../services/invoice.service'
import { InvoiceError } from '../domain/invoice';
import { issueInvoice, listInvoices, OrderNotFoundError } from '../services/invoice.service';


// 帳票出力
const invoiceSchema = z.object({
  invoiceNo: z.string().regex(/^[A-Za-z0-9_-]{1,32}$/),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  customerName: z.string().trim().min(1).max(100),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        quantity: z.number().int().min(1).max(999999),
        unitPrice: z.number().int().min(0).max(99999999),
      }),
    )
    .min(1)
    .max(MAX_ROWS),
  note: z.string().max(500).optional(),
})

export async function createInvoicePdfHandler(req: Request, res: Response) {
  const parsed = invoiceSchema.safeParse(req.body)
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: '入力内容が不正です', issues: parsed.error.issues })
  }

  try {
    const pdf = await createInvoicePdf(parsed.data)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice_${parsed.data.invoiceNo}.pdf"`,
    )
    res.send(Buffer.from(pdf))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'PDFの生成に失敗しました' })
  }
}

// 計算

function handleError(err: unknown, res: Response, next: NextFunction) {
  if (err instanceof OrderNotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof InvoiceError) {
    const status = err.code === 'INVALID_AMOUNT' ? 400 : 409; // 超過・状態不正は競合扱い
    return res.status(status).json({ error: err.message, code: err.code });
  }
  return next(err);
}

export function create(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const invoice = issueInvoice(req.params.id, req.body?.amount);
    res.status(201).json(invoice);
  } catch (err) {
    handleError(err, res, next);
  }
}

export function list(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(listInvoices(req.params.id));
  } catch (err) {
    handleError(err, res, next);
  }
}
