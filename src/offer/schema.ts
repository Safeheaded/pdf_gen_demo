import { z } from 'zod';
import { COMPANIES, getCompany, type Company } from '../companies/companies';
import { groszToInput, parseGrosz, parseQuantity } from '../domain/money';
import { isValidNip } from '../domain/nip';
import { addDays, buildOfferNumber, toIsoDate } from '../domain/offerNumber';
import { VAT_RATES, type LineItem } from '../domain/types';

export const itemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Podaj nazwę pozycji'),
  quantity: z.string().refine((v) => parseQuantity(v) !== null, 'Ilość musi być większa od 0'),
  unitNet: z.string().refine((v) => parseGrosz(v) !== null, 'Podaj poprawną cenę netto'),
  vatRate: z.enum(VAT_RATES),
});

export const offerFormSchema = z.object({
  companyId: z.string().refine((id) => COMPANIES.some((c) => c.id === id)),
  offerNumber: z.string().trim().min(1, 'Podaj numer oferty'),
  issueDate: z.string().min(1, 'Podaj datę wystawienia'),
  validityDays: z
    .string()
    .refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 365, 'Podaj liczbę dni (1–365)'),
  clientName: z.string().trim().min(1, 'Podaj nazwę firmy klienta'),
  clientNip: z.string().refine(isValidNip, 'Niepoprawny NIP (10 cyfr, poprawna suma kontrolna)'),
  clientContact: z.string().trim(),
  items: z.array(itemSchema).min(1, 'Dodaj co najmniej jedną pozycję'),
  notes: z.string(),
});

export type OfferFormValues = z.infer<typeof offerFormSchema>;
export type ItemFormValues = z.infer<typeof itemSchema>;

export type Offer = {
  company: Company;
  number: string;
  issueDate: Date;
  validUntil: Date;
  client: { name: string; nip: string; contactPerson: string };
  items: LineItem[];
  notes: string;
};

const parseIsoDate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const toOffer = (values: OfferFormValues): Offer => {
  const issueDate = parseIsoDate(values.issueDate);
  return {
    company: getCompany(values.companyId),
    number: values.offerNumber.trim(),
    issueDate,
    validUntil: addDays(issueDate, Number(values.validityDays)),
    client: {
      name: values.clientName.trim(),
      nip: values.clientNip,
      contactPerson: values.clientContact,
    },
    items: values.items.map((item) => ({
      id: item.id,
      name: item.name.trim(),
      quantity: parseQuantity(item.quantity) ?? 0,
      unitNetGrosz: parseGrosz(item.unitNet) ?? 0,
      vatRate: item.vatRate,
    })),
    notes: values.notes,
  };
};

export const newItem = (overrides: Partial<ItemFormValues> = {}): ItemFormValues => ({
  id: crypto.randomUUID(),
  name: '',
  quantity: '1',
  unitNet: '',
  vatRate: '23',
  ...overrides,
});

export const defaultFormValues = (today = new Date()): OfferFormValues => ({
  companyId: COMPANIES[0].id,
  offerNumber: buildOfferNumber(COMPANIES[0].code, today, 1),
  issueDate: toIsoDate(today),
  validityDays: '30',
  clientName: 'Przykładowa Firma Sp. z o.o.',
  clientNip: '5260006060',
  clientContact: 'Anna Kowalska',
  items: [
    newItem({ name: 'Audyt procesów sprzedażowych', quantity: '1', unitNet: '8500,00' }),
    newItem({ name: 'Warsztat dla zespołu (dzień)', quantity: '2', unitNet: groszToInput(120000) }),
    newItem({ name: 'Raport końcowy i rekomendacje', quantity: '1', unitNet: '2400,00', vatRate: '8' }),
  ],
  notes:
    'Płatność przelewem w terminie 14 dni od daty wystawienia faktury.\nCeny nie zawierają kosztów dojazdu poza miejscem siedziby Zleceniobiorcy.',
});
