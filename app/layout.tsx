import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const title = {
  default: 'Faktury — fakturowanie dla freelancerów',
  template: '%s · Faktury',
}
const description =
  'Wystawiaj faktury, wysyłaj je klientom i przyjmuj płatności online. Faktury cykliczne, przypomnienia i przejrzysty dashboard przychodów.'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: appUrl,
    siteName: 'Faktury',
    locale: 'pl_PL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pl" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
