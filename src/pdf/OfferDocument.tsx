import { Document, Page, Polygon, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import { amountInWords } from '../domain/amountInWords';
import { formatGrosz } from '../domain/money';
import { formatNip } from '../domain/nip';
import { formatDate } from '../domain/offerNumber';
import { calculateTotals, lineNetGrosz, vatLabel, vatPercent } from '../domain/totals';
import type { Offer } from '../offer/schema';
import { PDF_FONT } from './fonts';

const TEXT = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

const styles = StyleSheet.create({
  page: { fontFamily: PDF_FONT, fontSize: 9, color: TEXT, padding: 40, paddingBottom: 90 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmark: { fontSize: 13, fontWeight: 700 },
  docInfo: { alignItems: 'flex-end' },
  docTitle: { fontSize: 18, fontWeight: 700 },
  muted: { color: MUTED },
  accentBar: { height: 3, marginTop: 14, marginBottom: 18 },
  parties: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  party: { flex: 1 },
  partyLabel: { fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 },
  partyName: { fontWeight: 700, marginBottom: 2 },
  tableHeader: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 4, color: '#ffffff', fontWeight: 700 },
  row: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: LINE },
  colNo: { width: '5%' },
  colName: { width: '39%' },
  colQty: { width: '8%', textAlign: 'right' },
  colUnit: { width: '14%', textAlign: 'right' },
  colVat: { width: '8%', textAlign: 'right' },
  colNet: { width: '13%', textAlign: 'right' },
  colGross: { width: '13%', textAlign: 'right' },
  summary: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  vatTable: { width: '50%' },
  vatRow: { flexDirection: 'row', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: LINE },
  vatCell: { width: '25%', textAlign: 'right' },
  totalsBox: { width: '40%', alignItems: 'flex-end' },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 2 },
  grandTotal: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 6, marginTop: 4, color: '#ffffff', fontWeight: 700, fontSize: 11 },
  words: { marginTop: 8, textAlign: 'right', color: MUTED },
  notes: { marginTop: 22 },
  sectionTitle: { fontSize: 9, fontWeight: 700, marginBottom: 4 },
  footer: { position: 'absolute', left: 40, right: 40, bottom: 28, borderTopWidth: 0.5, borderTopColor: LINE, paddingTop: 6, fontSize: 7.5, color: MUTED },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
});

type Props = { offer: Offer };

export const OfferDocument = ({ offer }: Props) => {
  const { company, client } = offer;
  const totals = calculateTotals(offer.items);
  const accent = { backgroundColor: company.accentColor };

  return (
    <Document title={`Oferta ${offer.number}`} author={company.legalName}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Svg width={34} height={34} viewBox="0 0 40 40">
              <Polygon points={company.logo.points} fill={company.accentColor} />
            </Svg>
            <Text style={styles.wordmark}>{company.logo.wordmark}</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={[styles.docTitle, { color: company.accentColor }]}>OFERTA HANDLOWA</Text>
            <Text>Nr {offer.number}</Text>
            <Text style={styles.muted}>Data wystawienia: {formatDate(offer.issueDate)}</Text>
            <Text style={styles.muted}>Ważna do: {formatDate(offer.validUntil)}</Text>
          </View>
        </View>
        <View style={[styles.accentBar, accent]} />

        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={[styles.partyLabel, { color: company.accentColor }]}>Oferent</Text>
            <Text style={styles.partyName}>{company.legalName}</Text>
            <Text>{company.address.street}</Text>
            <Text>
              {company.address.postalCode} {company.address.city}
            </Text>
            <Text>NIP: {formatNip(company.nip)}</Text>
            <Text>KRS: {company.krs}</Text>
          </View>
          <View style={styles.party}>
            <Text style={[styles.partyLabel, { color: company.accentColor }]}>Dla</Text>
            <Text style={styles.partyName}>{client.name}</Text>
            <Text>NIP: {formatNip(client.nip)}</Text>
            {client.contactPerson ? <Text>Osoba kontaktowa: {client.contactPerson}</Text> : null}
          </View>
          <View style={styles.party}>
            <Text style={[styles.partyLabel, { color: company.accentColor }]}>Kontakt</Text>
            <Text style={styles.partyName}>{company.contact.person}</Text>
            <Text>{company.contact.email}</Text>
            <Text>{company.contact.phone}</Text>
            <Text>{company.contact.website}</Text>
          </View>
        </View>

        <View style={[styles.tableHeader, accent]} fixed>
          <Text style={styles.colNo}>Lp.</Text>
          <Text style={styles.colName}>Nazwa</Text>
          <Text style={styles.colQty}>Ilość</Text>
          <Text style={styles.colUnit}>Cena netto</Text>
          <Text style={styles.colVat}>VAT</Text>
          <Text style={styles.colNet}>Netto</Text>
          <Text style={styles.colGross}>Brutto</Text>
        </View>
        {offer.items.map((item, index) => {
          const net = lineNetGrosz(item);
          const gross = net + Math.round((net * vatPercent(item.vatRate)) / 100);
          return (
            <View key={item.id} style={styles.row} wrap={false}>
              <Text style={styles.colNo}>{index + 1}</Text>
              <Text style={styles.colName}>{item.name}</Text>
              <Text style={styles.colQty}>{String(item.quantity).replace('.', ',')}</Text>
              <Text style={styles.colUnit}>{formatGrosz(item.unitNetGrosz)}</Text>
              <Text style={styles.colVat}>{vatLabel(item.vatRate)}</Text>
              <Text style={styles.colNet}>{formatGrosz(net)}</Text>
              <Text style={styles.colGross}>{formatGrosz(gross)}</Text>
            </View>
          );
        })}

        <View wrap={false}>
          <View style={styles.summary}>
            <View style={styles.vatTable}>
              <View style={[styles.vatRow, { fontWeight: 700 }]}>
                <Text style={[styles.vatCell, { textAlign: 'left' }]}>Stawka</Text>
                <Text style={styles.vatCell}>Netto</Text>
                <Text style={styles.vatCell}>VAT</Text>
                <Text style={styles.vatCell}>Brutto</Text>
              </View>
              {totals.byRate.map((row) => (
                <View key={row.vatRate} style={styles.vatRow}>
                  <Text style={[styles.vatCell, { textAlign: 'left' }]}>{vatLabel(row.vatRate)}</Text>
                  <Text style={styles.vatCell}>{formatGrosz(row.netGrosz)}</Text>
                  <Text style={styles.vatCell}>{formatGrosz(row.vatGrosz)}</Text>
                  <Text style={styles.vatCell}>{formatGrosz(row.grossGrosz)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.totalsBox}>
              <View style={styles.totalLine}>
                <Text>Razem netto</Text>
                <Text>{formatGrosz(totals.netGrosz)}</Text>
              </View>
              <View style={styles.totalLine}>
                <Text>Razem VAT</Text>
                <Text>{formatGrosz(totals.vatGrosz)}</Text>
              </View>
              <View style={[styles.grandTotal, accent]}>
                <Text>Do zapłaty</Text>
                <Text>{formatGrosz(totals.grossGrosz)}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.words}>Słownie: {amountInWords(totals.grossGrosz)}</Text>
        </View>

        <View style={styles.notes} wrap={false}>
          <Text style={styles.sectionTitle}>Uwagi i warunki współpracy</Text>
          <Text>{offer.notes || '—'}</Text>
          <Text style={[styles.muted, { marginTop: 6 }]}>
            Oferta ważna do {formatDate(offer.validUntil)}.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text>
              {company.legalName}, {company.address.street}, {company.address.postalCode}{' '}
              {company.address.city}
            </Text>
            <Text render={({ pageNumber, totalPages }) => `Strona ${pageNumber} / ${totalPages}`} />
          </View>
          <Text>
            NIP {formatNip(company.nip)} · KRS {company.krs} · REGON {company.regon} · {company.registryNote}
          </Text>
          <Text>
            {company.bank.name} · IBAN: {company.bank.iban} · SWIFT: {company.bank.swift}
          </Text>
          <Text>Dane demonstracyjne – spółki i dane są fikcyjne.</Text>
        </View>
      </Page>
    </Document>
  );
};
