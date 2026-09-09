import { requireCompany } from '@/lib/auth'
import { getInvoiceOr404 } from '@/lib/data/invoices'
import { buildInvoiceView } from '@/lib/invoice-view'
import { invoicePdfFilename, renderInvoicePdf } from '@/lib/pdf/render-invoice'

export const runtime = 'nodejs'

export async function GET(_req: Request, ctx: RouteContext<'/invoices/[id]/pdf'>) {
  const { user, company } = await requireCompany()
  const { id } = await ctx.params
  const invoice = await getInvoiceOr404(user.id, id)

  const view = buildInvoiceView(invoice, company)
  const pdf = await renderInvoicePdf({
    number: view.number,
    issueDate: view.issueDate,
    saleDate: view.saleDate,
    dueDate: view.dueDate,
    currency: view.currency,
    seller: view.seller,
    sellerIban: view.sellerIban,
    buyer: view.buyer,
    lines: view.lines,
    vatBreakdown: view.vatBreakdown,
    totalNet: view.totalNet,
    totalVat: view.totalVat,
    totalGross: view.totalGross,
    notes: view.notes,
  })

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoicePdfFilename(view.number)}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
