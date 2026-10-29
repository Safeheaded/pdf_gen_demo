import { usePDF } from '@react-pdf/renderer';
import { useEffect } from 'react';
import { registerFonts } from '../pdf/fonts';
import { OfferDocument } from '../pdf/OfferDocument';
import type { Offer } from '../offer/schema';
import styles from './PdfPanel.module.css';

registerFonts(import.meta.env.BASE_URL + 'fonts/');

type Props = { offer: Offer | null; canDownload: boolean; disabledReason: string };

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
        <h2 className={styles.title}>Podgląd PDF</h2>
        {ready ? (
          <a className={styles.download} href={instance.url ?? undefined} download={fileName(offer)}>
            Pobierz PDF
          </a>
        ) : (
          <button className={styles.download} type="button" disabled>
            Pobierz PDF
          </button>
        )}
      </div>
      {!canDownload && <p className={styles.hint}>{disabledReason}</p>}
      {instance.error && <p className={styles.hint}>Nie udało się wygenerować podglądu.</p>}
      {instance.url ? (
        <iframe className={styles.frame} src={`${instance.url}#toolbar=0`} title="Podgląd oferty PDF" />
      ) : (
        <p className={styles.hint}>Generowanie podglądu…</p>
      )}
    </section>
  );
}
