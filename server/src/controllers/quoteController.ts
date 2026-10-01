import { Request, Response } from 'express';
import { buildQuote } from '../services/quote.service';

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
