const WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

export const normalizeNip = (input: string): string => input.replace(/[\s-]/g, '');

export const isValidNip = (input: string): boolean => {
  const nip = normalizeNip(input);
  if (!/^\d{10}$/.test(nip)) return false;
  const sum = WEIGHTS.reduce((acc, weight, i) => acc + weight * Number(nip[i]), 0);
  return sum % 11 === Number(nip[9]);
};

export const formatNip = (input: string): string => {
  const nip = normalizeNip(input);
  return nip.length === 10
    ? `${nip.slice(0, 3)}-${nip.slice(3, 6)}-${nip.slice(6, 8)}-${nip.slice(8)}`
    : input;
};
