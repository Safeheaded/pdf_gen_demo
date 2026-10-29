import { VAT_RATES, type LineItem, type OfferTotals, type VatRate, type VatSummaryRow } from './types';

export const vatPercent = (rate: VatRate): number => (rate === 'zw' ? 0 : Number(rate));

export const vatLabel = (rate: VatRate): string => (rate === 'zw' ? 'zw.' : `${rate}%`);

export const lineNetGrosz = (item: Pick<LineItem, 'quantity' | 'unitNetGrosz'>): number =>
  Math.round(item.quantity * item.unitNetGrosz);

const vatOf = (netGrosz: number, rate: VatRate): number =>
  Math.round((netGrosz * vatPercent(rate)) / 100);

export const calculateTotals = (items: readonly LineItem[]): OfferTotals => {
  const byRate: VatSummaryRow[] = [];
  for (const vatRate of VAT_RATES) {
    const rateItems = items.filter((item) => item.vatRate === vatRate);
    if (rateItems.length === 0) continue;
    const netGrosz = rateItems.reduce((sum, item) => sum + lineNetGrosz(item), 0);
    const vatGrosz = vatOf(netGrosz, vatRate);
    byRate.push({ vatRate, netGrosz, vatGrosz, grossGrosz: netGrosz + vatGrosz });
  }
  return {
    byRate,
    netGrosz: byRate.reduce((sum, row) => sum + row.netGrosz, 0),
    vatGrosz: byRate.reduce((sum, row) => sum + row.vatGrosz, 0),
    grossGrosz: byRate.reduce((sum, row) => sum + row.grossGrosz, 0),
  };
};
