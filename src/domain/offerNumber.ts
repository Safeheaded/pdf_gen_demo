export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

export const toIsoDate = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/** Offer number like OF/NT/2026/10/001. */
export const buildOfferNumber = (companyCode: string, date: Date, sequence: number): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `OF/${companyCode}/${date.getFullYear()}/${month}/${String(sequence).padStart(3, '0')}`;
};
