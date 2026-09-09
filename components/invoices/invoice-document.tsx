import { formatAmount, formatMoney, formatQuantity } from '@/lib/money'
import { formatDate } from '@/lib/date'
import { formatNip } from '@/lib/nip'
import { formatIban } from '@/lib/iban'
import type { ComputedLine, VatBreakdownRow } from '@/lib/invoice'

export type Party = {
  name: string
  taxId?: string | null
  addressLine?: string | null
  postalCode?: string | null
  city?: string | null
}

function PartyBlock({ label, party }: { label: string; party: Party }) {
  const cityLine = [party.postalCode, party.city].filter(Boolean).join(' ')
  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="font-medium">{party.name}</p>
      {party.addressLine ? (
        <p className="text-muted-foreground text-sm">{party.addressLine}</p>
      ) : null}
      {cityLine ? <p className="text-muted-foreground text-sm">{cityLine}</p> : null}
      {party.taxId ? (
        <p className="text-muted-foreground text-sm">NIP {formatNip(party.taxId)}</p>
      ) : null}
    </div>
  )
}

export function InvoiceDocument({
  number,
  issueDate,
  saleDate,
  dueDate,
  currency,
  seller,
  sellerIban,
  buyer,
  lines,
  vatBreakdown,
  totalNet,
  totalVat,
  totalGross,
  notes,
}: {
  number: string
  issueDate: Date | string
  saleDate: Date | string
  dueDate: Date | string
  currency: string
  seller: Party
  sellerIban?: string | null
  buyer: Party
  lines: ComputedLine[]
  vatBreakdown: VatBreakdownRow[]
  totalNet: number
  totalVat: number
  totalGross: number
  notes?: string | null
}) {
  return (
    <div className="border-border bg-surface flex flex-col gap-8 rounded-xl border p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Faktura</p>
          <p className="text-2xl font-semibold tracking-tight">{number}</p>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Data wystawienia</dt>
          <dd className="text-right tabular-nums">{formatDate(issueDate)}</dd>
          <dt className="text-muted-foreground">Data sprzedaży</dt>
          <dd className="text-right tabular-nums">{formatDate(saleDate)}</dd>
          <dt className="text-muted-foreground">Termin płatności</dt>
          <dd className="text-right font-medium tabular-nums">{formatDate(dueDate)}</dd>
        </dl>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <PartyBlock label="Sprzedawca" party={seller} />
        <PartyBlock label="Nabywca" party={buyer} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-xs tracking-wide uppercase">
              <th className="py-2 pr-3 text-left font-medium">Nazwa</th>
              <th className="px-3 py-2 text-right font-medium">Ilość</th>
              <th className="px-3 py-2 text-right font-medium">Cena netto</th>
              <th className="px-3 py-2 text-right font-medium">VAT</th>
              <th className="px-3 py-2 text-right font-medium">Netto</th>
              <th className="py-2 pl-3 text-right font-medium">Brutto</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="py-2.5 pr-3">{line.name}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {formatQuantity(line.quantity)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {formatAmount(line.unitPriceNet)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {formatQuantity(line.vatRate)}%
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatAmount(line.net)}</td>
                <td className="py-2.5 pl-3 text-right font-medium tabular-nums">
                  {formatAmount(line.gross)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs tracking-wide uppercase">
                <th className="pr-4 text-left font-medium">Stawka</th>
                <th className="px-4 text-right font-medium">Netto</th>
                <th className="px-4 text-right font-medium">VAT</th>
                <th className="pl-4 text-right font-medium">Brutto</th>
              </tr>
            </thead>
            <tbody>
              {vatBreakdown.map((row) => (
                <tr key={row.rate}>
                  <td className="pr-4 tabular-nums">{formatQuantity(row.rate)}%</td>
                  <td className="px-4 text-right tabular-nums">{formatAmount(row.net)}</td>
                  <td className="px-4 text-right tabular-nums">{formatAmount(row.vat)}</td>
                  <td className="pl-4 text-right tabular-nums">{formatAmount(row.gross)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="ml-auto grid w-full max-w-xs gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Razem netto</dt>
            <dd className="tabular-nums">{formatMoney(totalNet, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Razem VAT</dt>
            <dd className="tabular-nums">{formatMoney(totalVat, currency)}</dd>
          </div>
          <div className="border-border flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Do zapłaty</dt>
            <dd className="tabular-nums">{formatMoney(totalGross, currency)}</dd>
          </div>
        </dl>
      </div>

      {(sellerIban || notes) && (
        <div className="border-border text-muted-foreground flex flex-col gap-2 border-t pt-6 text-sm">
          {sellerIban ? (
            <p>
              <span className="text-foreground">Numer konta:</span> {formatIban(sellerIban)}
            </p>
          ) : null}
          {notes ? <p className="whitespace-pre-wrap">{notes}</p> : null}
        </div>
      )}
    </div>
  )
}
