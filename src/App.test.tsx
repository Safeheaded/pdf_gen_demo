import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

vi.mock('./components/PdfPanel', () => ({
  default: ({ offer, canDownload }: { offer: { company: { name: string }; number: string } | null; canDownload: boolean }) => (
    <div>
      <p data-testid="preview">{offer ? `${offer.company.name} ${offer.number}` : 'no preview'}</p>
      <button disabled={!canDownload}>Pobierz PDF</button>
    </div>
  ),
}));

describe('App', () => {
  it('switching company updates company card and preview data', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText('Wybierz spółkę z grupy'), 'Nordica Tech sp. z o.o.');

    expect(screen.getByText(/NIP 5260002027/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('preview')).toHaveTextContent(/Nordica Tech OF\/NT\//));
  });

  it('blocks download when the client NIP is invalid', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Pobierz PDF' })).toBeEnabled();

    const nip = screen.getByLabelText('NIP');
    await user.clear(nip);
    await user.type(nip, '1234567890');

    expect(await screen.findByText(/Niepoprawny NIP/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pobierz PDF' })).toBeDisabled();
  });

  it('adds and removes line items, and requires at least one', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Dodaj pozycję' }));
    expect(screen.getAllByLabelText('Nazwa usługi / produktu')).toHaveLength(4);

    for (const button of screen.getAllByRole('button', { name: /Usuń pozycję/ })) {
      await user.click(button);
    }
    expect(screen.queryAllByLabelText('Nazwa usługi / produktu')).toHaveLength(0);
    expect(await screen.findByText('Dodaj co najmniej jedną pozycję')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pobierz PDF' })).toBeDisabled();
  });
});
