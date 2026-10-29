# PDF Offer Generator (demo)

A browser-only generator of branded A4 sales offers (PDF). Pick one of four
group companies, fill in client data and line items, watch the live preview and
download the PDF. Totals, VAT per rate and the amount in words are calculated
automatically.

All companies, logos, NIP/KRS numbers and bank accounts are **fictional demo data**.

## Features

- Company dropdown (4 companies): logo, accent color, registry data (NIP, KRS, REGON),
  address, contact details and bank footer change automatically.
- Offer form: client data (NIP checksum validation), line items (quantity, net
  price, VAT 23/8/5/0%/zw.), notes, issue date and validity period.
- Live PDF preview with debounced re-rendering, polish decimal input (`12,50`).
- Amounts are kept in integer grosz, so there are no floating point errors.
- Runs entirely in the browser; no backend, no data leaves the machine.

## Stack

Vite, React 18, TypeScript (strict), `@react-pdf/renderer`, React Hook Form + zod,
CSS Modules, Vitest + Testing Library.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # unit and UI tests
pnpm build      # static build in dist/
pnpm samples    # regenerate samples/*.pdf (one per company)
```

The `dist/` folder is a static site and can be hosted anywhere (Vercel, Netlify,
GitHub Pages, any web server).

## Project structure

```
src/domain/     pure business logic (totals, money, NIP, amount in words) + tests
src/companies/  typed config of the companies - add a company here only
src/offer/      form schema (zod) and mapping form values -> offer
src/pdf/        PDF document (react-pdf) and font registration
src/components/ form and preview UI
samples/        generated example PDFs
```

## Adapting to the real client

The layout lives in `src/pdf/OfferDocument.tsx` and the company data in
`src/companies/companies.ts`. Replacing the demo logos with the client's files
and matching the visual template only requires changes in those two places.
