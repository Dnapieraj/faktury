import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { formatMoney } from '@/lib/money'
import { formatDate } from '@/lib/date'

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily: 'Inter, Arial, sans-serif',
  padding: '32px 0',
}
const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  maxWidth: '520px',
  margin: '0 auto',
  padding: '32px',
}
const brand = { fontSize: '13px', fontWeight: 700, color: '#4f46e5', letterSpacing: '0.5px' }
const h1 = { fontSize: '20px', fontWeight: 700, color: '#1a1a2e', margin: '16px 0 8px' }
const p = { fontSize: '14px', lineHeight: '22px', color: '#374151', margin: '0 0 12px' }
const muted = { fontSize: '12px', lineHeight: '18px', color: '#6b7280' }
const amount = { fontSize: '26px', fontWeight: 700, color: '#1a1a2e', margin: '4px 0' }
const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 20px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }

function Shell({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>FAKTURY</Text>
          {children}
          <Hr style={hr} />
          <Text style={muted}>
            Wiadomość wysłana automatycznie przez aplikację Faktury. Nie odpowiadaj na nią.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

type InvoiceEmailData = {
  number: string
  sellerName: string
  clientName: string
  totalGross: number
  currency: string
  dueDate: Date | string
  payUrl: string
}

export function InvoiceIssuedEmail(d: InvoiceEmailData) {
  return (
    <Shell
      preview={`${d.sellerName}: faktura ${d.number} na ${formatMoney(d.totalGross, d.currency)}`}
    >
      <Heading style={h1}>Faktura {d.number}</Heading>
      <Text style={p}>
        Dzień dobry{d.clientName ? `, ${d.clientName}` : ''}. {d.sellerName} wystawił(a) dla Ciebie
        fakturę. Dokument w formacie PDF znajdziesz w załączniku.
      </Text>
      <Section>
        <Text style={muted}>Do zapłaty</Text>
        <Text style={amount}>{formatMoney(d.totalGross, d.currency)}</Text>
        <Text style={muted}>Termin płatności: {formatDate(d.dueDate)}</Text>
      </Section>
      <Section style={{ margin: '20px 0 4px' }}>
        <Button href={d.payUrl} style={button}>
          Zapłać online
        </Button>
      </Section>
      <Text style={muted}>Płatność kartą lub BLIK-iem obsługuje Stripe.</Text>
    </Shell>
  )
}

export function InvoicePaidEmail(d: {
  number: string
  clientName: string
  totalGross: number
  currency: string
  paidAt: Date | string
  invoiceUrl: string
}) {
  return (
    <Shell preview={`Faktura ${d.number} została opłacona`}>
      <Heading style={h1}>Płatność otrzymana 🎉</Heading>
      <Text style={p}>
        Faktura <strong>{d.number}</strong> dla {d.clientName} została opłacona.
      </Text>
      <Section>
        <Text style={muted}>Kwota</Text>
        <Text style={amount}>{formatMoney(d.totalGross, d.currency)}</Text>
        <Text style={muted}>Data płatności: {formatDate(d.paidAt)}</Text>
      </Section>
      <Section style={{ margin: '20px 0 4px' }}>
        <Button href={d.invoiceUrl} style={button}>
          Otwórz fakturę
        </Button>
      </Section>
    </Shell>
  )
}

export function InvoiceReminderEmail(d: InvoiceEmailData & { daysOverdue: number }) {
  return (
    <Shell preview={`Przypomnienie: faktura ${d.number} po terminie`}>
      <Heading style={h1}>Przypomnienie o płatności</Heading>
      <Text style={p}>
        Dzień dobry{d.clientName ? `, ${d.clientName}` : ''}. Faktura <strong>{d.number}</strong> od{' '}
        {d.sellerName} jest{' '}
        {d.daysOverdue > 0 ? `${d.daysOverdue} dni po terminie` : 'wymagalna dziś'}.
      </Text>
      <Section>
        <Text style={muted}>Do zapłaty</Text>
        <Text style={amount}>{formatMoney(d.totalGross, d.currency)}</Text>
        <Text style={muted}>Termin płatności był: {formatDate(d.dueDate)}</Text>
      </Section>
      <Section style={{ margin: '20px 0 4px' }}>
        <Button href={d.payUrl} style={button}>
          Zapłać teraz
        </Button>
      </Section>
      <Text style={muted}>Jeśli płatność została już wykonana, zignoruj tę wiadomość.</Text>
    </Shell>
  )
}
