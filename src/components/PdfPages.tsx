import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useEffect, useRef, useState } from 'react';
import styles from './PdfPages.module.css';

GlobalWorkerOptions.workerSrc = workerUrl;

type Props = { blob: Blob };

/** Renders every page of a PDF as stacked canvases, so the preview has its natural height. */
export const PdfPages = ({ blob }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const loadingTask = useRef<PDFDocumentLoadingTask | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [width, setWidth] = useState(0);
  const [failedBlob, setFailedBlob] = useState<Blob | null>(null);
  const [failedDoc, setFailedDoc] = useState<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;
    void blob.arrayBuffer().then((data) => {
      if (cancelled) return;
      const loading = getDocument({ data });
      loading.promise
        .then((next) => {
          if (cancelled) return void loading.destroy();
          const previous = loadingTask.current;
          loadingTask.current = loading;
          setDoc(next);
          // The previous document stays alive until the new one replaces it on screen.
          void previous?.destroy();
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          console.error(error);
          setFailedBlob(blob);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [blob]);

  useEffect(() => () => void loadingTask.current?.destroy(), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!doc || width === 0) return;
    let cancelled = false;
    const pixelRatio = window.devicePixelRatio || 1;

    const renderPage = async (pageNumber: number) => {
      const page = await doc.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: (width / base.width) * pixelRatio });
      const offscreen = document.createElement('canvas');
      offscreen.width = Math.floor(viewport.width);
      offscreen.height = Math.floor(viewport.height);
      await page.render({ canvas: offscreen, viewport }).promise;
      const visible = canvasRefs.current[pageNumber - 1];
      if (cancelled || !visible) return;
      visible.width = offscreen.width;
      visible.height = offscreen.height;
      visible.getContext('2d')?.drawImage(offscreen, 0, 0);
    };

    Promise.all(Array.from({ length: doc.numPages }, (_, i) => renderPage(i + 1))).catch(
      (error: unknown) => {
        if (cancelled) return;
        console.error(error);
        setFailedDoc(doc);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [doc, width]);

  const failed = failedBlob === blob || (doc !== null && failedDoc === doc);

  return (
    <div ref={containerRef} className={styles.pages}>
      {failed && <p className={styles.error}>Nie udało się wygenerować podglądu.</p>}
      {doc &&
        Array.from({ length: doc.numPages }, (_, index) => (
          <canvas
            key={index}
            ref={(element) => {
              canvasRefs.current[index] = element;
            }}
            className={styles.page}
            aria-label={`Strona ${index + 1} z ${doc.numPages}`}
          />
        ))}
    </div>
  );
};
