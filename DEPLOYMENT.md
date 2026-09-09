# Wdrożenie — Vercel + Neon

## 1. Baza danych (Neon)

1. Utwórz projekt na [neon.tech](https://neon.tech) (region EU — Frankfurt).
2. Skopiuj **pooled** connection string (`...-pooler...`) — to będzie `DATABASE_URL`.
3. Migracje puszczasz z lokalnej maszyny wskazując na Neona:
   ```bash
   DATABASE_URL="postgresql://…neon…" npx prisma migrate deploy
   ```
   (albo dodaj to jako krok w CI / w `vercel build`).

`lib/prisma.ts` używa `@prisma/adapter-pg` i tego samego `DATABASE_URL` lokalnie i na produkcji.

## 2. Aplikacja (Vercel)

Import repo do Vercela. Framework wykryje się jako Next.js. Build: `npm run build`
(uruchamia `prisma generate` + `next build`).

### Zmienne środowiskowe (Production + Preview)

| Zmienna                                 | Skąd                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`                          | Neon (pooled)                                                           |
| `AUTH_SECRET`                           | `npx auth secret`                                                       |
| `AUTH_URL`                              | `https://twoja-domena.vercel.app`                                       |
| `NEXT_PUBLIC_APP_URL`                   | to samo co `AUTH_URL`                                                   |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console → OAuth 2.0                                        |
| `STRIPE_SECRET_KEY`                     | Stripe → Developers → API keys                                          |
| `STRIPE_WEBHOOK_SECRET`                 | patrz krok 4                                                            |
| `RESEND_API_KEY`                        | resend.com → API Keys                                                   |
| `EMAIL_FROM`                            | np. `Faktury <faktury@twoja-domena.pl>` (domena zweryfikowana w Resend) |
| `CRON_SECRET`                           | Vercel ustawia sam dla Cron; wpisz też ręcznie (dowolny losowy ciąg)    |

## 3. Google OAuth

W Google Cloud Console → _Credentials_ → _OAuth client ID_ (Web):

- **Authorized redirect URI:** `https://twoja-domena.vercel.app/api/auth/callback/google`
- lokalnie dodatkowo: `http://localhost:3000/api/auth/callback/google`

## 4. Stripe webhook

Stripe Dashboard → _Developers_ → _Webhooks_ → _Add endpoint_:

- **URL:** `https://twoja-domena.vercel.app/api/stripe/webhook`
- **Events:** `checkout.session.completed`, `checkout.session.expired`
- Skopiuj _Signing secret_ (`whsec_...`) do `STRIPE_WEBHOOK_SECRET`.

Testy w trybie test mode; przełącz klucze na `live` gdy gotowe.

## 5. Resend

Zweryfikuj domenę wysyłkową (DNS: SPF + DKIM). Do czasu weryfikacji działa
`onboarding@resend.dev` (tylko na Twój własny adres).

## 6. Cron

`vercel.json` deklaruje dwa zadania (Vercel uruchamia je automatycznie po deployu):

| Ścieżka               | Harmonogram (UTC) | Co robi                                                             |
| --------------------- | ----------------- | ------------------------------------------------------------------- |
| `/api/cron/overdue`   | codziennie 07:00  | faktury po terminie → „zaległa” + przypomnienie                     |
| `/api/cron/recurring` | codziennie 06:00  | wystawia faktury z aktywnych szablonów, których dzień właśnie minął |

Endpointy wymagają nagłówka `Authorization: Bearer $CRON_SECRET` (Vercel dodaje go sam).
Ręczne wywołanie do testów:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://twoja-domena.vercel.app/api/cron/overdue
```

## 7. Po deployu

- Zaloguj się, uzupełnij dane firmy w _Ustawieniach_ (NIP, adres, IBAN).
- Wystaw fakturę testową → „Wyślij klientowi” → opłać kartą testową Stripe `4242 4242 4242 4242`.
- Sprawdź, czy webhook oznaczył ją jako opłaconą i przyszło potwierdzenie.
