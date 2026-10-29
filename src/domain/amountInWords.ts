const UNITS = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
const TEENS = [
  'dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście',
  'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście',
];
const TENS = [
  '', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt',
  'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt',
];
const HUNDREDS = [
  '', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset',
  'sześćset', 'siedemset', 'osiemset', 'dziewięćset',
];

const plural = (n: number, one: string, few: string, many: string): string => {
  if (n === 1) return one;
  const lastTwo = n % 100;
  const last = n % 10;
  return last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? few : many;
};

const belowThousand = (n: number): string => {
  const parts: string[] = [HUNDREDS[Math.floor(n / 100)]];
  const rest = n % 100;
  if (rest >= 10 && rest < 20) parts.push(TEENS[rest - 10]);
  else parts.push(TENS[Math.floor(rest / 10)], UNITS[rest % 10]);
  return parts.filter(Boolean).join(' ');
};

const integerInWords = (n: number): string => {
  if (n === 0) return 'zero';
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (millions) {
    parts.push(belowThousand(millions), plural(millions, 'milion', 'miliony', 'milionów'));
  }
  if (thousands === 1) parts.push('tysiąc');
  else if (thousands) {
    parts.push(belowThousand(thousands), plural(thousands, 'tysiąc', 'tysiące', 'tysięcy'));
  }
  if (rest) parts.push(belowThousand(rest));
  return parts.join(' ');
};

/** "Słownie" line for an amount in grosz, e.g. "sto dwadzieścia trzy złote 45/100". */
export const amountInWords = (grosz: number): string => {
  const zloty = Math.floor(grosz / 100);
  const cents = String(grosz % 100).padStart(2, '0');
  const currency = plural(zloty, 'złoty', 'złote', 'złotych');
  return `${integerInWords(zloty)} ${currency} ${cents}/100`;
};
