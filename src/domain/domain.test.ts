import { amountInWords } from './amountInWords';
import { formatGrosz, parseGrosz, parseQuantity } from './money';
import { isValidNip, formatNip } from './nip';
import { buildOfferNumber } from './offerNumber';
import { calculateTotals } from './totals';
import type { LineItem } from './types';
import { COMPANIES } from '../companies/companies';

const item = (overrides: Partial<LineItem>): LineItem => ({
  id: 'x',
  name: 'Usługa',
  quantity: 1,
  unitNetGrosz: 10000,
  vatRate: '23',
  ...overrides,
});

describe('calculateTotals', () => {
  it.each([
    ['empty list', [], 0, 0, 0],
    ['single 23% item', [item({})], 10000, 2300, 12300],
    ['0% rate has no VAT', [item({ vatRate: '0' })], 10000, 0, 10000],
    ['zw rate has no VAT', [item({ vatRate: 'zw' })], 10000, 0, 10000],
    ['fractional quantity rounds to grosz', [item({ quantity: 1.5, unitNetGrosz: 333 })], 500, 115, 615],
    [
      'mixed rates',
      [item({}), item({ vatRate: '8', unitNetGrosz: 5000, quantity: 2 })],
      20000,
      2300 + 800,
      23100,
    ],
  ])('%s', (_name, items, net, vat, gross) => {
    const totals = calculateTotals(items);
    expect([totals.netGrosz, totals.vatGrosz, totals.grossGrosz]).toEqual([net, vat, gross]);
  });

  it('groups VAT per rate and sums net before computing VAT', () => {
    const totals = calculateTotals([
      item({ unitNetGrosz: 333 }),
      item({ unitNetGrosz: 333 }),
      item({ unitNetGrosz: 333, vatRate: '8' }),
    ]);
    expect(totals.byRate.map((r) => [r.vatRate, r.netGrosz, r.vatGrosz])).toEqual([
      ['23', 666, 153],
      ['8', 333, 27],
    ]);
  });
});

describe('money parsing and formatting', () => {
  it.each([
    ['12,50', 1250],
    ['12.5', 1250],
    ['1 234,56', 123456],
    ['100', 10000],
  ])('parseGrosz(%s)', (input, expected) => expect(parseGrosz(input)).toBe(expected));

  it.each(['', 'abc', '1,234', '-5'])('parseGrosz rejects %j', (input) =>
    expect(parseGrosz(input)).toBeNull(),
  );

  it('parseQuantity accepts comma and rejects zero', () => {
    expect(parseQuantity('1,5')).toBe(1.5);
    expect(parseQuantity('0')).toBeNull();
  });

  it('formats PLN with Polish separators', () => {
    expect(formatGrosz(123456).replace(/\s/g, ' ')).toBe('1 234,56 zł');
  });
});

describe('amountInWords', () => {
  it.each([
    [0, 'zero złotych zero groszy'],
    [100, 'jeden złoty zero groszy'],
    [250, 'dwa złote pięćdziesiąt groszy'],
    [500, 'pięć złotych zero groszy'],
    [1200, 'dwanaście złotych zero groszy'],
    [12345, 'sto dwadzieścia trzy złote czterdzieści pięć groszy'],
    [100000, 'tysiąc złotych zero groszy'],
    [250000, 'dwa tysiące pięćset złotych zero groszy'],
    [2200000, 'dwadzieścia dwa tysiące złotych zero groszy'],
    [101, 'jeden złoty jeden grosz'],
    [102, 'jeden złoty dwa grosze'],
    [112, 'jeden złoty dwanaście groszy'],
    [123456789, 'jeden milion dwieście trzydzieści cztery tysiące pięćset sześćdziesiąt siedem złotych osiemdziesiąt dziewięć groszy'],
  ])('%i grosz', (grosz, expected) => {
    expect(amountInWords(grosz)).toBe(expected);
  });
});

describe('NIP', () => {
  it('accepts valid and rejects invalid checksums', () => {
    expect(isValidNip('526-000-10-16')).toBe(true);
    expect(isValidNip('5260001017')).toBe(false);
    expect(isValidNip('123')).toBe(false);
  });

  it('formats a NIP with dashes', () => {
    expect(formatNip('5260001016')).toBe('526-000-10-16');
  });

  it('all demo companies have valid NIPs', () => {
    expect(COMPANIES.every((c) => isValidNip(c.nip))).toBe(true);
  });
});

describe('buildOfferNumber', () => {
  it('pads month and sequence', () => {
    expect(buildOfferNumber('NT', new Date(2026, 9, 29), 1)).toBe('OF/NT/2026/10/001');
  });
});
