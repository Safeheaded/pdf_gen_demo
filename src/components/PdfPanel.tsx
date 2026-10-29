import { usePDF } from '@react-pdf/renderer';
import { useEffect } from 'react';
import { registerFonts } from '../pdf/fonts';
import { OfferDocument } from '../pdf/OfferDocument';
import type { Offer } from '../offer/schema';
import { PdfPages } from './PdfPages';
import styles from './PdfPanel.module.css';

registerFonts(import.meta.env.BASE_URL + 'fonts/');

type Props = { offer: Offer | null; canDownload: boolean; disabledReason: string };

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const fileName = (offer: Offer | null): string =>
  `oferta-${(offer?.number ?? 'demo').replace(/[^\w-]+/g, '-')}.pdf`;

export default function PdfPanel({ offer, canDownload, disabledReason }: Props) {
  const [instance, update] = usePDF({ document: offer ? <OfferDocument offer={offer} /> : undefined });

  useEffect(() => {
    if (offer) update(<OfferDocument offer={offer} />);
  }, [offer, update]);

  const ready = canDownload && !!instance.url && !instance.loading && !instance.error;

  return (
    <section className={styles.panel} aria-label="Podgląd oferty">
      <div className={styles.toolbar}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Podgląd PDF</h2>
          <span className={styles.chip}>Format A4</span>
        </div>
        {ready ? (
          <a className={styles.download} href={instance.url ?? undefined} download={fileName(offer)}>
            <DownloadIcon />
            Pobierz PDF
          </a>
        ) : (
          <button className={styles.download} type="button" disabled>
            <DownloadIcon />
            Pobierz PDF
          </button>
        )}
      </div>
      {!canDownload && <p className={styles.hint}>{disabledReason}</p>}
      {instance.error && <p className={styles.hint}>Nie udało się wygenerować podglądu.</p>}
      {instance.blob ? (
        <PdfPages blob={instance.blob} />
      ) : (
        <p className={styles.hint}>Generowanie podglądu…</p>
      )}
    </section>
  );
}
