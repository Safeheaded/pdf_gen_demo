import { zodResolver } from '@hookform/resolvers/zod';
import { lazy, Suspense, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { OfferForm } from './components/OfferForm';
import { StickyColumn } from './components/StickyColumn';
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

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" transform="rotate(45 12 12)" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Generator ofert handlowych</h1>
            <p className={styles.subtitle}>Wersja demonstracyjna — dane spółek i kalkulacja na żywo</p>
          </div>
        </div>
        <span className={styles.badge}>
          <span className={styles.dot} aria-hidden="true" />
          Dane demonstracyjne
        </span>
      </header>
      <main className={styles.main}>
        <StickyColumn className={styles.column}>
          <OfferForm form={form} />
        </StickyColumn>
        <StickyColumn className={styles.column}>
          <Suspense fallback={<p>Ładowanie podglądu…</p>}>
            <PdfPanel
              offer={offer}
              canDownload={form.formState.isValid && offer !== null}
              disabledReason="Uzupełnij poprawnie formularz, aby pobrać PDF."
            />
          </Suspense>
        </StickyColumn>
      </main>
    </div>
  );
}
