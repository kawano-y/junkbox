import { Request, Response } from 'express';
import { buildQuote } from '../services/quote.service';
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