import { Request, Response } from 'express';
import { buildQuote, registerQuote } from '../services/quote.service';
import { QuoteConversionError } from '../domain/quote';
import { NotFoundError, convertToOrder } from '../services/quote.service';

export const calculate = (req: Request, res: Response) => {
  try {
    const { lines, lineRounding, taxRounding } = req.body;
    const result = buildQuote(lines, {
      lineRounding: lineRounding ?? 'floor',
      taxRounding: taxRounding ?? 'floor',
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
};

export function convertQuote(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const order = convertToOrder(id);
    res.status(201).json(order);
  } catch (e) {
    if (e instanceof NotFoundError) return res.status(404).json({ message: e.message });
    if (e instanceof QuoteConversionError) {
      const status = e.code === 'EXPIRED' ? 422 : 409;
      return res.status(status).json({ code: e.code, message: e.message });
    }
    throw e;
  }
}


export function register(req: Request, res: Response) {
  try {
    const { customerName, validUntil, lines, lineRounding, taxRounding } = req.body;
    const validUntilDate = validUntil != null ? new Date(validUntil) : undefined;
    if (validUntilDate && Number.isNaN(validUntilDate.getTime())) {
      return res.status(400).json({ error: "validUntil の日付形式が不正です" });
    }

    const quote = registerQuote(customerName, validUntilDate, lines, lineRounding, taxRounding);
    res.status(201).json(quote);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
}
