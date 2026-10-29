const formatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  useGrouping: 'always',
});

export const formatGrosz = (grosz: number): string => formatter.format(grosz / 100);

/** Parses user input such as "1 234,50" or "12.5" into integer grosz; null when invalid. */
export const parseGrosz = (input: string): number | null => {
  const normalized = input.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [zloty, fraction = ''] = normalized.split('.');
  return Number(zloty) * 100 + Number(fraction.padEnd(2, '0'));
};

/** Parses a positive quantity such as "2" or "1,5"; null when invalid. */
export const parseQuantity = (input: string): number | null => {
  const normalized = input.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,3})?$/.test(normalized)) return null;
  const value = Number(normalized);
  return value > 0 ? value : null;
};

export const groszToInput = (grosz: number): string =>
  (grosz / 100).toFixed(2).replace('.', ',');
