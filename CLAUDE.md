# PDF Offer Generator (demo)

Browser-only app: pick one of 4 fictional group companies, fill in client data and
line items, preview and download a branded A4 offer PDF. Built as a demo attached
to a freelance proposal. No backend, no database, no auth.

React rules live in `docs/react-guidelines.md`. Read them before touching UI code.

## Stack
Vite, React 18, TypeScript (strict), @react-pdf/renderer, React Hook Form + zod,
CSS Modules, Vitest + Testing Library, pnpm.

## Commands
- `pnpm dev` - dev server
- `pnpm test` - run tests
- `pnpm lint` / `pnpm typecheck` / `pnpm build`
Run lint, typecheck and tests before declaring a task done.

## Scope rules
- Stay within the agreed scope: company select -> client data -> line items ->
  live preview -> PDF download. Do not add drafts/localStorage, history, email,
  login, or extra pages unless asked.
- All data is fictional and must be visibly marked "demo data". Never use real
  company names, logos, NIP/KRS or bank accounts.
- UI and PDF text are in Polish; code, comments, commits and README are in English.

## Code rules
- TypeScript strict, no `any`, no non-null assertions without a reason.
- Money is stored as integer grosz (minor units). Never use floats for amounts.
  Format only at the display edge (`Intl.NumberFormat('pl-PL')`).
- Business logic (totals, VAT per rate, amount in words, offer number, NIP
  checksum) lives in pure functions under `src/domain/`, with unit tests.
- Company data lives in one typed config (`src/companies/`), not scattered in JSX.
- Adding a fifth company must require touching only that config.
- Comments only where the "why" is not obvious. No commented-out code.
- No new dependency without a one-line justification in the commit message.

## Testing
- Test behavior, not implementation: render, interact, assert on visible output.
- Domain functions need table-driven tests (rounding, 0%/zw. VAT, empty list).
- Tests are colocated as `*.test.ts(x)`.

## Git
- Small, focused commits, imperative mood, English.
- Do not commit generated PDFs except the 4 samples in `samples/`.
- Never force push; never rewrite history without being asked.

## Workflow
- Before large changes, state the plan in a few lines and wait if it deviates
  from this file.
- If requirements are ambiguous, ask instead of guessing.
