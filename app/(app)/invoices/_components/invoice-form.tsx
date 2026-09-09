'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { saveInvoiceAction, type InvoiceFormState } from '../actions'
import { computeInvoiceTotals } from '@/lib/invoice'
import { formatMoney } from '@/lib/money'
import { addDays, toDateInputValue } from '@/lib/date'
import { useActionState } from 'react'
import { Alert } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SubmitButton } from '@/components/ui/submit-button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const VAT_RATES = [23, 8, 5, 0]

type Row = { key: string; name: string; quantity: string; unitPriceNet: string; vatRate: string }

let counter = 0
const newRow = (vatRate: number): Row => ({
  key: `row-${counter++}`,
  name: '',
  quantity: '1',
  unitPriceNet: '',
  vatRate: String(vatRate),
})

export type InvoiceFormValues = {
  id?: string
  clientId?: string
  issueDate?: string
  saleDate?: string
  dueDate?: string
  notes?: string | null
  items?: { name: string; quantity: string; unitPriceNet: string; vatRate: string }[]
}

export function InvoiceForm({
  clients,
  defaults,
  values,
  cancelHref = '/invoices',
}: {
  clients: { id: string; name: string }[]
  defaults: { vatRate: number; paymentTermDays: number }
  values?: InvoiceFormValues
  cancelHref?: string
}) {
  const [state, action] = useActionState<InvoiceFormState, FormData>(saveInvoiceAction, {})
  const fe = state.fieldErrors

  const today = toDateInputValue()
  const [issueDate, setIssueDate] = useState(values?.issueDate ?? today)
  const [saleDate, setSaleDate] = useState(values?.saleDate ?? values?.issueDate ?? today)
  const [dueDate, setDueDate] = useState(
    values?.dueDate ?? toDateInputValue(addDays(new Date(), defaults.paymentTermDays)),
  )
  const [dueDirty, setDueDirty] = useState(Boolean(values?.dueDate))

  const [rows, setRows] = useState<Row[]>(
    values?.items?.length
      ? values.items.map((it) => ({ key: `row-${counter++}`, ...it }))
      : [newRow(defaults.vatRate)],
  )

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function onIssueDateChange(value: string) {
    setIssueDate(value)
    if (!dueDirty && value) {
      setDueDate(toDateInputValue(addDays(new Date(`${value}T12:00:00`), defaults.paymentTermDays)))
    }
  }

  const totals = useMemo(
    () =>
      computeInvoiceTotals(
        rows.map((r) => ({
          name: r.name,
          quantity: Number(r.quantity) || 0,
          unitPriceNet: Number(r.unitPriceNet) || 0,
          vatRate: Number(r.vatRate) || 0,
        })),
      ),
    [rows],
  )

  const itemsPayload = JSON.stringify(
    rows.map((r) => ({
      name: r.name,
      quantity: r.quantity,
      unitPriceNet: r.unitPriceNet,
      vatRate: r.vatRate,
    })),
  )

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <input type="hidden" name="items" value={itemsPayload} />
      <input type="hidden" name="issueDate" value={issueDate} />
      <input type="hidden" name="saleDate" value={saleDate} />
      <input type="hidden" name="dueDate" value={dueDate} />

      <Card>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field
            className="sm:col-span-2"
            label="Klient"
            htmlFor="clientId"
            required
            error={fe?.clientId}
          >
            {clients.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Najpierw{' '}
                <Link href="/clients/new" className="text-primary hover:underline">
                  dodaj klienta
                </Link>
                .
              </p>
            ) : (
              <Select
                id="clientId"
                name="clientId"
                defaultValue={values?.clientId ?? ''}
                aria-invalid={Boolean(fe?.clientId)}
              >
                <option value="" disabled>
                  Wybierz klienta…
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Data wystawienia" htmlFor="issueDate" required error={fe?.issueDate}>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => onIssueDateChange(e.target.value)}
            />
          </Field>
          <Field label="Data sprzedaży" htmlFor="saleDate" error={fe?.saleDate}>
            <Input
              id="saleDate"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
            />
          </Field>
          <Field label="Termin płatności" htmlFor="dueDate" required error={fe?.dueDate}>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value)
                setDueDirty(true)
              }}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Pozycje</CardTitle>
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, newRow(defaults.vatRate)])}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <Plus />
            Dodaj pozycję
          </button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {fe?.items ? <Alert variant="danger">{fe.items[0]}</Alert> : null}

          <div className="text-muted-foreground hidden gap-2 px-1 text-xs font-medium tracking-wide uppercase sm:grid sm:grid-cols-[1fr_5rem_7rem_5rem_7rem_2rem]">
            <span>Nazwa</span>
            <span className="text-right">Ilość</span>
            <span className="text-right">Cena netto</span>
            <span className="text-right">VAT</span>
            <span className="text-right">Wartość brutto</span>
            <span />
          </div>

          {rows.map((row, index) => {
            const line = totals.lines[index]
            return (
              <div
                key={row.key}
                className="border-border grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_5rem_7rem_5rem_7rem_2rem] sm:items-center sm:border-0 sm:p-0"
              >
                <Input
                  aria-label="Nazwa pozycji"
                  placeholder="np. Usługa programistyczna"
                  value={row.name}
                  onChange={(e) => updateRow(row.key, { name: e.target.value })}
                />
                <Input
                  aria-label="Ilość"
                  type="number"
                  min="0"
                  step="0.001"
                  className="sm:text-right"
                  value={row.quantity}
                  onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                />
                <Input
                  aria-label="Cena netto"
                  type="number"
                  min="0"
                  step="0.01"
                  className="sm:text-right"
                  value={row.unitPriceNet}
                  onChange={(e) => updateRow(row.key, { unitPriceNet: e.target.value })}
                />
                <Select
                  aria-label="Stawka VAT"
                  value={row.vatRate}
                  onChange={(e) => updateRow(row.key, { vatRate: e.target.value })}
                >
                  {VAT_RATES.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </Select>
                <span className="text-sm font-medium tabular-nums sm:text-right">
                  {formatMoney(line?.gross ?? 0)}
                </span>
                <button
                  type="button"
                  aria-label="Usuń pozycję"
                  onClick={() =>
                    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== row.key) : rs))
                  }
                  disabled={rows.length === 1}
                  className="text-muted-foreground hover:bg-surface-muted hover:text-danger grid size-8 place-items-center justify-self-end rounded-md disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )
          })}

          <dl className="mt-2 ml-auto grid w-full max-w-xs gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Netto</dt>
              <dd className="tabular-nums">{formatMoney(totals.totalNet)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">VAT</dt>
              <dd className="tabular-nums">{formatMoney(totals.totalVat)}</dd>
            </div>
            <div className="border-border flex justify-between border-t pt-1.5 text-base font-semibold">
              <dt>Do zapłaty</dt>
              <dd className="tabular-nums">{formatMoney(totals.totalGross)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Field label="Uwagi na fakturze" htmlFor="notes" error={fe?.notes}>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={values?.notes ?? ''}
              placeholder="np. Dziękujemy za współpracę."
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Link href={cancelHref} className={cn(buttonVariants({ variant: 'ghost' }))}>
          Anuluj
        </Link>
        <SubmitButton disabled={clients.length === 0}>
          {values?.id ? 'Zapisz zmiany' : 'Zapisz szkic'}
        </SubmitButton>
      </div>
    </form>
  )
}
