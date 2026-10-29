import { renderToFile } from '@react-pdf/renderer';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { COMPANIES } from '../src/companies/companies';
import { buildOfferNumber } from '../src/domain/offerNumber';
import { registerFonts } from '../src/pdf/fonts';
import { OfferDocument } from '../src/pdf/OfferDocument';
import { defaultFormValues, toOffer } from '../src/offer/schema';

const root = resolve(import.meta.dirname, '..');
registerFonts(`${root}/public/fonts/`);
mkdirSync(`${root}/samples`, { recursive: true });

const today = new Date(2026, 9, 29);

for (const company of COMPANIES) {
  const values = {
    ...defaultFormValues(today),
    companyId: company.id,
    offerNumber: buildOfferNumber(company.code, today, 1),
  };
  const target = `${root}/samples/oferta-${company.id}.pdf`;
  await renderToFile(<OfferDocument offer={toOffer(values)} />, target);
  console.log(`Wrote ${target}`);
}
