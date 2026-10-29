# React Guidelines

## Components
- Function components only. One exported component per file, named like the file.
- Keep components small and presentational; move logic to hooks or `src/domain/`.
- Composition over configuration: prefer `children` and slots to long prop lists
  or boolean flags. Do not use `React.cloneElement` or inspect `children`.
- Spread remaining props onto the root element when a component wraps a DOM node.
- Props are typed with an explicit `type`/`interface`; no `React.FC`.

## State
- Keep the minimum state; derive everything else during render (totals, VAT
  summary, offer number). Never mirror derived values in state or sync them
  with `useEffect`.
- Form state lives in one place (React Hook Form + zod schema) and is the single
  source of truth for both the form and the live preview.
- Lift state only as far as needed. No global store for this app; context only
  if prop drilling exceeds two levels.
- Line items need stable ids (`crypto.randomUUID()`), never array index as `key`.

## Effects
- `useEffect` only for syncing with the outside world (e.g. object URLs for the
  PDF blob). Clean up what you create (`URL.revokeObjectURL`).
- No data fetching or business logic in effects.

## Performance
- Do not memoize by default. Add `useMemo`/`useCallback`/`React.memo` only for
  measured problems; the PDF preview is the expected one.
- Debounce the PDF re-render (~300 ms) so typing stays responsive.
- Lazy-load the PDF renderer (`React.lazy`) to keep initial load small.

## PDF document
- The PDF is its own component tree (`@react-pdf/renderer`), separate from the
  DOM UI. Share only data types and domain functions, not components.
- Register an embedded font with full Polish diacritics (Inter or Roboto).
- Accent color, logo and footer come from the selected company config only.
- Handle table page breaks: repeat the table header, keep the totals block together.

## Forms and UX
- Every input has a visible `<label>`; errors are linked via `aria-describedby`.
- Keyboard-only flow must work: add/remove row, select company, download.
- Validate inline with zod (NIP checksum, quantity > 0, price >= 0); the
  Download button is disabled with a visible reason while the form is invalid.
- Polish decimal input (comma) must be accepted and normalized.

## Styling
- CSS Modules only (`Component.module.css` next to the component). No Tailwind,
  no CSS-in-JS, no inline styles except for dynamic values (e.g. company accent).
- Design tokens (colors, spacing, radius) as CSS variables in one global file;
  no magic numbers.

## Testing
- Testing Library queries by role/label/text; no snapshot tests of markup.
- Cover: switching company updates preview data, totals update when a row
  changes, invalid NIP blocks download, removing the last row is handled.
- PDF output itself is verified manually via the 4 sample files.
