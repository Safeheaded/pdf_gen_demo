import { zodResolver } from '@hookform/resolvers/zod';
import { lazy, Suspense, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { getCompany } from './companies/companies';
import { OfferForm } from './components/OfferForm';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { defaultFormValues, offerFormSchema, toOffer, type OfferFormValues } from './offer/schema';
import styles from './App.module.css';

const PdfPanel = lazy(() => import('./components/PdfPanel'));

export default function App() {
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: defaultFormValues(),
    mode: 'onChange',
  });
  const values = useWatch({ control: form.control }) as OfferFormValues;
  const debounced = useDebouncedValue(values, 300);

  const offer = useMemo(() => {
    const parsed = offerFormSchema.safeParse(debounced);
    return parsed.success ? toOffer(parsed.data) : null;
  }, [debounced]);

  const accent = getCompany(values.companyId).accentColor;

  return (
    <div className={styles.app} style={{ ['--color-accent' as string]: accent }}>
      <header className={styles.header}>
        <h1>Generator ofert PDF</h1>
        <p>Wersja demonstracyjna – spółki i dane są fikcyjne.</p>
      </header>
      <main className={styles.main}>
        <OfferForm form={form} />
        <Suspense fallback={<p>Ładowanie podglądu…</p>}>
          <PdfPanel
            offer={offer}
            canDownload={form.formState.isValid && offer !== null}
            disabledReason="Uzupełnij poprawnie formularz, aby pobrać PDF."
          />
        </Suspense>
      </main>
    </div>
  );
}
