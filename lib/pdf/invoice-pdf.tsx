import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatAmount, formatMoney, formatQuantity } from '@/lib/money'
import { formatDate } from '@/lib/date'
import { formatNip } from '@/lib/nip'
import { formatIban } from '@/lib/iban'
import type { ComputedLine, VatBreakdownRow } from '@/lib/invoice'

export type PdfParty = {
  name: string
  taxId?: string | null
  addressLine?: string | null
  postalCode?: string | null
  city?: string | null
}

export type InvoicePdfProps = {
  number: string
  issueDate: Date | string
  saleDate: Date | string
  dueDate: Date | string
  currency: string
  seller: PdfParty
  sellerIban?: string | null
  buyer: PdfParty
  lines: ComputedLine[]
  vatBreakdown: VatBreakdownRow[]
  totalNet: number
  totalVat: number
  totalGross: number
  notes?: string | null
}

const INK = '#1a1a2e'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'
const ACCENT = '#4f46e5'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: INK,
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 44,
    lineHeight: 1.4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  docLabel: { fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: 1 },
  docNumber: { fontSize: 20, fontWeight: 700, marginTop: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2 },
  metaLabel: { color: MUTED, marginRight: 10 },
  metaValue: { width: 78, textAlign: 'right' },
  parties: { flexDirection: 'row', marginTop: 28 },
  party: { flex: 1, paddingRight: 16 },
  partyLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  partyName: { fontWeight: 600, fontSize: 10 },
  partyLine: { color: MUTED },
  table: { marginTop: 28 },
  th: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: INK,
    paddingBottom: 5,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 6,
  },
  cName: { flex: 1, paddingRight: 6 },
  cNum: { width: 60, textAlign: 'right' },
  cVat: { width: 42, textAlign: 'right' },
  colLabel: { fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  vatTable: { flexGrow: 1 },
  vatHeadRow: { flexDirection: 'row', marginBottom: 3 },
  vatCell: { width: 70, textAlign: 'right' },
  vatRateCell: { width: 44 },
  totals: { width: 210 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: INK,
  },
  grandLabel: { fontSize: 11, fontWeight: 700 },
  grandValue: { fontSize: 11, fontWeight: 700 },
  payBox: {
    marginTop: 26,
    padding: 12,
    backgroundColor: '#f5f5fb',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
  notes: { marginTop: 16, color: MUTED },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 44,
    right: 44,
    textAlign: 'center',
    fontSize: 7.5,
    color: MUTED,
  },
})

function Party({ label, party }: { label: string; party: PdfParty }) {
  const cityLine = [party.postalCode, party.city].filter(Boolean).join(' ')
  return (
    <View style={s.party}>
      <Text style={s.partyLabel}>{label}</Text>
      <Text style={s.partyName}>{party.name}</Text>
      {party.addressLine ? <Text style={s.partyLine}>{party.addressLine}</Text> : null}
      {cityLine ? <Text style={s.partyLine}>{cityLine}</Text> : null}
      {party.taxId ? <Text style={s.partyLine}>NIP {formatNip(party.taxId)}</Text> : null}
    </View>
  )
}

export function InvoicePdf(props: InvoicePdfProps) {
  const { currency } = props
  return (
    <Document
      title={`Faktura ${props.number}`}
      author={props.seller.name}
      creator="Faktury"
      producer="Faktury"
    >
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.docLabel}>Faktura</Text>
            <Text style={s.docNumber}>{props.number}</Text>
          </View>
          <View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Data wystawienia</Text>
              <Text style={s.metaValue}>{formatDate(props.issueDate)}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Data sprzedaży</Text>
              <Text style={s.metaValue}>{formatDate(props.saleDate)}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Termin płatności</Text>
              <Text style={[s.metaValue, { fontWeight: 700 }]}>{formatDate(props.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={s.parties}>
          <Party label="Sprzedawca" party={props.seller} />
          <Party label="Nabywca" party={props.buyer} />
        </View>

        <View style={s.table}>
          <View style={s.th}>
            <Text style={[s.cName, s.colLabel]}>Nazwa</Text>
            <Text style={[s.cNum, s.colLabel]}>Ilość</Text>
            <Text style={[s.cNum, s.colLabel]}>Cena netto</Text>
            <Text style={[s.cVat, s.colLabel]}>VAT</Text>
            <Text style={[s.cNum, s.colLabel]}>Netto</Text>
            <Text style={[s.cNum, s.colLabel]}>Brutto</Text>
          </View>
          {props.lines.map((line, i) => (
            <View style={s.tr} key={i} wrap={false}>
              <Text style={s.cName}>{line.name}</Text>
              <Text style={s.cNum}>{formatQuantity(line.quantity)}</Text>
              <Text style={s.cNum}>{formatAmount(line.unitPriceNet)}</Text>
              <Text style={s.cVat}>{formatQuantity(line.vatRate)}%</Text>
              <Text style={s.cNum}>{formatAmount(line.net)}</Text>
              <Text style={[s.cNum, { fontWeight: 600 }]}>{formatAmount(line.gross)}</Text>
            </View>
          ))}
        </View>

        <View style={s.summary}>
          <View style={s.vatTable}>
            <View style={s.vatHeadRow}>
              <Text style={[s.vatRateCell, s.colLabel]}>Stawka</Text>
              <Text style={[s.vatCell, s.colLabel]}>Netto</Text>
              <Text style={[s.vatCell, s.colLabel]}>VAT</Text>
              <Text style={[s.vatCell, s.colLabel]}>Brutto</Text>
            </View>
            {props.vatBreakdown.map((row) => (
              <View style={s.vatHeadRow} key={row.rate}>
                <Text style={s.vatRateCell}>{formatQuantity(row.rate)}%</Text>
                <Text style={s.vatCell}>{formatAmount(row.net)}</Text>
                <Text style={s.vatCell}>{formatAmount(row.vat)}</Text>
                <Text style={s.vatCell}>{formatAmount(row.gross)}</Text>
              </View>
            ))}
          </View>

          <View style={s.totals}>
            <View style={s.totalRow}>
              <Text style={{ color: MUTED }}>Razem netto</Text>
              <Text>{formatMoney(props.totalNet, currency)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={{ color: MUTED }}>Razem VAT</Text>
              <Text>{formatMoney(props.totalVat, currency)}</Text>
            </View>
            <View style={s.grandRow}>
              <Text style={s.grandLabel}>Do zapłaty</Text>
              <Text style={s.grandValue}>{formatMoney(props.totalGross, currency)}</Text>
            </View>
          </View>
        </View>

        {props.sellerIban ? (
          <View style={s.payBox}>
            <Text style={{ color: MUTED }}>Prosimy o wpłatę na konto</Text>
            <Text style={{ fontWeight: 600, marginTop: 2 }}>{formatIban(props.sellerIban)}</Text>
          </View>
        ) : null}

        {props.notes ? <Text style={s.notes}>{props.notes}</Text> : null}

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `${props.number} · strona ${pageNumber} z ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
