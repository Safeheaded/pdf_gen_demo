export const VAT_RATES = ['23', '8', '5', '0', 'zw'] as const;

export type VatRate = (typeof VAT_RATES)[number];

export type LineItem = {
  id: string;
  name: string;
  quantity: number;
  unitNetGrosz: number;
  vatRate: VatRate;
};

export type LineTotals = {
  netGrosz: number;
  vatGrosz: number;
  grossGrosz: number;
};

export type VatSummaryRow = LineTotals & { vatRate: VatRate };

export type OfferTotals = LineTotals & { byRate: VatSummaryRow[] };
