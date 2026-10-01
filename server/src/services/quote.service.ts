import {
  calculateQuote,
  CalcOptions,
  DEFAULT_OPTIONS,
  QuoteLineInput,
  QuoteTotals,
} from '../domain/quote';

export function buildQuote(
  lines: QuoteLineInput[],
  options: CalcOptions = DEFAULT_OPTIONS,
): QuoteTotals {
  return calculateQuote(lines, options);
}
