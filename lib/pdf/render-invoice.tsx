import 'server-only'
import path from 'node:path'
import { Font, renderToBuffer } from '@react-pdf/renderer'
import { InvoicePdf, type InvoicePdfProps } from './invoice-pdf'

let fontsRegistered = false

function registerFonts() {
  if (fontsRegistered) return
  const dir = path.join(process.cwd(), 'public', 'fonts')
  Font.register({
    family: 'Inter',
    fonts: [
      { src: path.join(dir, 'inter-400.ttf'), fontWeight: 400 },
      { src: path.join(dir, 'inter-500.ttf'), fontWeight: 500 },
      { src: path.join(dir, 'inter-600.ttf'), fontWeight: 600 },
      { src: path.join(dir, 'inter-700.ttf'), fontWeight: 700 },
    ],
  })
  // Inter has no true italics bundled here; keep line-break hyphenation off.
  Font.registerHyphenationCallback((word) => [word])
  fontsRegistered = true
}

export async function renderInvoicePdf(props: InvoicePdfProps): Promise<Buffer> {
  registerFonts()
  return renderToBuffer(<InvoicePdf {...props} />)
}

/** `FV/2026/0001` -> `FV_2026_0001` for a safe filename. */
export function invoicePdfFilename(number: string): string {
  return `${number.replace(/[^\w-]+/g, '_')}.pdf`
}
