export type RoundingMode = 'floor' | 'ceil' | 'round';

/** 端数処理。金額は円の整数で扱う前提。 */
export function roundYen(value: number, mode: RoundingMode): number {
  switch (mode) {
    case 'floor':
      return Math.floor(value);
    case 'ceil':
      return Math.ceil(value);
    case 'round':
      return Math.round(value);
  }
}
