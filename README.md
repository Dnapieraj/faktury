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

Wymagania: Node 24 (patrz `.nvmrc`). Baza lokalna działa przez `prisma dev` — bez Dockera.

```bash
cp .env.example .env        # uzupełnij AUTH_SECRET: npx auth secret
npm install
npm run db:up               # lokalny Postgres przez `prisma dev` (w tle)
npm run db:migrate          # migracje Prisma + generacja klienta
npm run dev                 # http://localhost:3000
```

Jeśli `prisma dev` wypisze inne porty niż w `.env.example`, sprawdź je przez `npx prisma dev ls`
i zaktualizuj `DATABASE_URL` / `SHADOW_DATABASE_URL`. Na produkcji `DATABASE_URL` to connection
string z Neona (`postgresql://...`) — `lib/prisma.ts` używa `@prisma/adapter-pg` w obu przypadkach.

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
