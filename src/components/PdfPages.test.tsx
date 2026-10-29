import { act, render, screen, waitFor } from '@testing-library/react';
import { PdfPages } from './PdfPages';

const getDocument = vi.fn();

vi.mock('pdfjs-dist', () => ({
  getDocument: (...args: unknown[]) => getDocument(...args),
  GlobalWorkerOptions: {},
}));
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: 'worker.js' }));

const makeBlob = () => Object.assign(new Blob(['pdf']), { arrayBuffer: async () => new ArrayBuffer(1) });

const documentWithPages = (numPages: number) => ({
  promise: Promise.resolve({ numPages }),
  destroy: vi.fn(),
});

describe('PdfPages', () => {
  beforeEach(() => {
    getDocument.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows an error for a broken file and clears it once a new file renders', async () => {
    getDocument.mockReturnValueOnce({ promise: Promise.reject(new Error('broken')), destroy: vi.fn() });
    getDocument.mockReturnValueOnce(documentWithPages(2));

    const { rerender } = render(<PdfPages blob={makeBlob()} />);
    expect(await screen.findByText('Nie udało się wygenerować podglądu.')).toBeInTheDocument();

    rerender(<PdfPages blob={makeBlob()} />);

    expect(await screen.findByLabelText('Strona 2 z 2')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText('Nie udało się wygenerować podglądu.')).not.toBeInTheDocument(),
    );
  });

  it('does not report an error when a file is replaced while still loading', async () => {
    let rejectFirst: (reason: Error) => void = () => {};
    getDocument.mockReturnValueOnce({
      promise: new Promise((_, reject) => (rejectFirst = reject)),
      destroy: vi.fn(),
    });
    getDocument.mockReturnValueOnce(documentWithPages(1));

    const { rerender } = render(<PdfPages blob={makeBlob()} />);
    await waitFor(() => expect(getDocument).toHaveBeenCalledTimes(1));
    rerender(<PdfPages blob={makeBlob()} />);
    await screen.findByLabelText('Strona 1 z 1');
    rejectFirst(new Error('destroyed'));

    await waitFor(() =>
      expect(screen.queryByText('Nie udało się wygenerować podglądu.')).not.toBeInTheDocument(),
    );
  });

  it('does not report an error when the previous file is destroyed while the new one loads', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private callback: ResizeObserverCallback) {}
        observe() {
          this.callback([{ contentRect: { width: 700 } } as ResizeObserverEntry], this as never);
        }
        disconnect() {}
      },
    );
    const page = {
      getViewport: () => ({ width: 700, height: 990 }),
      render: () => ({ promise: Promise.resolve() }),
    };
    const loadable = (numPages: number) => {
      let destroyed = false;
      return {
        doc: {
          numPages,
          getPage: async () => {
            await new Promise((resolve) => setTimeout(resolve, 5));
            if (destroyed) throw new Error('Transport destroyed');
            return page;
          },
        },
        destroy: vi.fn(async () => {
          destroyed = true;
        }),
      };
    };
    const first = loadable(1);
    const second = loadable(2);
    let finishSecond: () => void = () => {};
    getDocument.mockReturnValueOnce({ promise: Promise.resolve(first.doc), destroy: first.destroy });
    getDocument.mockReturnValueOnce({
      promise: new Promise((resolve) => (finishSecond = () => resolve(second.doc))),
      destroy: second.destroy,
    });

    const { rerender } = render(<PdfPages blob={makeBlob()} />);
    await screen.findByLabelText('Strona 1 z 1');
    rerender(<PdfPages blob={makeBlob()} />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      finishSecond();
    });

    expect(await screen.findByLabelText('Strona 2 z 2')).toBeInTheDocument();
    expect(screen.queryByText('Nie udało się wygenerować podglądu.')).not.toBeInTheDocument();
  });
});
