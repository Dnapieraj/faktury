'use client'

import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { saveRecurringAction, type RecurringFormState } from '../actions'
import { computeInvoiceTotals } from '@/lib/invoice'
import { formatMoney } from '@/lib/money'
import { toDateInputValue } from '@/lib/date'
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
const newRow = (vat: number): Row => ({
  key: `r-${counter++}`,
  name: '',
  quantity: '1',
  unitPriceNet: '',
  vatRate: String(vat),
})

export type RecurringFormValues = {
  id?: string
  clientId?: string
  dayOfMonth?: number
  paymentTermDays?: number
  startDate?: string
  endDate?: string | null
  notes?: string | null
  items?: { name: string; quantity: string; unitPriceNet: string; vatRate: string }[]
}

export function RecurringForm({
  clients,
  defaults,
  values,
  cancelHref = '/recurring',
}: {
  clients: { id: string; name: string }[]
  defaults: { vatRate: number; paymentTermDays: number }
  values?: RecurringFormValues
  cancelHref?: string
}) {
  const [state, action] = useActionState<RecurringFormState, FormData>(saveRecurringAction, {})
  const fe = state.fieldErrors

  const [rows, setRows] = useState<Row[]>(
    values?.items?.length
      ? values.items.map((it) => ({ key: `r-${counter++}`, ...it }))
      : [newRow(defaults.vatRate)],
  )
  const update = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))

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

      <Card>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field
            className="sm:col-span-2"
            label="Klient"
            htmlFor="clientId"
            required
            error={fe?.clientId}
          >
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
          </Field>

          <Field
            label="Dzień miesiąca"
            htmlFor="dayOfMonth"
            required
            error={fe?.dayOfMonth}
            hint="1–28. Wtedy co miesiąc wystawi się faktura."
          >
            <Input
              id="dayOfMonth"
              name="dayOfMonth"
              type="number"
              min={1}
              max={28}
              defaultValue={values?.dayOfMonth ?? 1}
              aria-invalid={Boolean(fe?.dayOfMonth)}
            />
          </Field>

          <Field
            label="Termin płatności (dni)"
            htmlFor="paymentTermDays"
            required
            error={fe?.paymentTermDays}
          >
            <Input
              id="paymentTermDays"
              name="paymentTermDays"
              type="number"
              min={0}
              max={365}
              defaultValue={values?.paymentTermDays ?? defaults.paymentTermDays}
              aria-invalid={Boolean(fe?.paymentTermDays)}
            />
          </Field>

          <Field label="Początek" htmlFor="startDate" required error={fe?.startDate}>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={values?.startDate ?? toDateInputValue()}
            />
          </Field>

          <Field
            label="Koniec (opcjonalnie)"
            htmlFor="endDate"
            error={fe?.endDate}
            hint="Po tej dacie szablon się wstrzyma."
          >
            <Input id="endDate" name="endDate" type="date" defaultValue={values?.endDate ?? ''} />
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
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="border-border grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_4.5rem_7rem_4.5rem_7rem_2rem] sm:items-center sm:border-0 sm:p-0"
            >
              <Input
                aria-label="Nazwa"
                placeholder="np. Abonament miesięczny"
                value={row.name}
                onChange={(e) => update(row.key, { name: e.target.value })}
              />
              <Input
                aria-label="Ilość"
                type="number"
                min="0"
                step="0.001"
                className="sm:text-right"
                value={row.quantity}
                onChange={(e) => update(row.key, { quantity: e.target.value })}
              />
              <Input
                aria-label="Cena netto"
                type="number"
                min="0"
                step="0.01"
                className="sm:text-right"
                value={row.unitPriceNet}
                onChange={(e) => update(row.key, { unitPriceNet: e.target.value })}
              />
              <Select
                aria-label="VAT"
                value={row.vatRate}
                onChange={(e) => update(row.key, { vatRate: e.target.value })}
              >
                {VAT_RATES.map((r) => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </Select>
              <span className="text-sm font-medium tabular-nums sm:text-right">
                {formatMoney(totals.lines[index]?.gross ?? 0)}
              </span>
              <button
                type="button"
                aria-label="Usuń"
                disabled={rows.length === 1}
                onClick={() =>
                  setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== row.key) : rs))
                }
                className="text-muted-foreground hover:bg-surface-muted hover:text-danger grid size-8 place-items-center justify-self-end rounded-md disabled:opacity-40"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <dl className="mt-2 ml-auto grid w-full max-w-xs gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Netto</dt>
              <dd className="tabular-nums">{formatMoney(totals.totalNet)}</dd>
            </div>
            <div className="border-border flex justify-between border-t pt-1.5 text-base font-semibold">
              <dt>Brutto / miesiąc</dt>
              <dd className="tabular-nums">{formatMoney(totals.totalGross)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Field label="Uwagi na fakturze" htmlFor="notes" error={fe?.notes}>
            <Textarea id="notes" name="notes" rows={2} defaultValue={values?.notes ?? ''} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Link href={cancelHref} className={cn(buttonVariants({ variant: 'ghost' }))}>
          Anuluj
        </Link>
        <SubmitButton disabled={clients.length === 0}>
          {values?.id ? 'Zapisz zmiany' : 'Utwórz szablon'}
        </SubmitButton>
      </div>
    </form>
  )
}
