# Faktury

Aplikacja do fakturowania dla freelancerów i małych firm. Każdy użytkownik = jedna firma z własnymi
klientami i fakturami (izolacja po `userId`).

**Zakres:** wystawianie faktur → PDF → wysyłka mailem z linkiem do płatności Stripe → webhook
`checkout.session.completed` → status „opłacona” → potwierdzenie do właściciela. Do tego faktury
cykliczne (Vercel Cron) i codzienne oznaczanie zaległości + przypomnienia.

## Stack

Next.js 16 (App Router, RSC, Server Actions) · TypeScript · Prisma + PostgreSQL (Neon na prod) ·
Auth.js (email/hasło + Google) · Tailwind CSS v4 · Stripe · Resend · `@react-pdf/renderer` ·
Vercel Cron · Vitest + Playwright + GitHub Actions.

## Uruchomienie lokalne

Wymagania: Node 24 (patrz `.nvmrc`), Docker Desktop.

```bash
cp .env.example .env        # uzupełnij AUTH_SECRET: npx auth secret
npm install
npm run db:up               # Postgres w Dockerze (localhost:5432)
npm run db:migrate          # migracje Prisma + generacja klienta
npm run dev                 # http://localhost:3000
```

Przydatne: `npm run db:studio`, `npm run db:seed`, `npm run typecheck`, `npm run lint`,
`npm run format`.

## Struktura

```
app/                 # trasy (App Router)
components/ui/        # design system (Button, Input, Card, Badge, ...)
lib/                  # prisma client, utils, helpers domenowe
prisma/schema.prisma # model danych
```

## Roadmapa

- [x] Schemat Prisma + design system + landing
- [ ] Auth.js (email/hasło + Google)
- [ ] CRUD klientów i faktur
- [ ] Generowanie PDF
- [ ] Stripe Checkout + webhooki
- [ ] Faktury cykliczne + przypomnienia (cron)
- [ ] Dashboard z wykresem przychodu
