# Shijia Community Commerce Platform

[Live application](https://shijia-site.vercel.app)

Shijia is a production Next.js platform supporting restaurant reservations, menu orders, Stripe payments, donations, email notifications, and back-office operations for a community organization.

The project focuses on the less visible parts of a real transaction system: authoritative pricing, payment state, webhook replay, reconciliation, rate limiting, and operational diagnosis.

## Product workflows

- Public menu and reservation flow
- Booking-linked orders and Stripe Checkout
- Donation creation, checkout, confirmation, and administration
- Payment and booking email notifications
- Administrative order search, filtering, and CSV export
- Risk dashboard for amount mismatches, stale pending payments, and repeated phone activity

## Reliability and safety

- **Server-authoritative pricing:** item names, availability, and prices are loaded from PostgreSQL rather than trusted from browser input.
- **Idempotent checkout:** Stripe sessions use an order-based idempotency key and can be reused instead of duplicated.
- **Signed webhooks:** Stripe signatures are verified before payment events are processed.
- **State-guarded payment updates:** webhook replays cannot repeatedly move an order from `pending` to `paid`.
- **Idempotent notifications:** paid-order email events are deduplicated by order.
- **Input and abuse controls:** payload validation, donation limits, currency checks, and endpoint rate limits.
- **Operational reconciliation:** exports compare order totals with line-item totals, while the risk view surfaces mismatches and stuck payments.

## Architecture

| Layer | Technologies |
|---|---|
| Application | Next.js App Router, TypeScript |
| Data | Supabase, PostgreSQL |
| Payments | Stripe Checkout and webhooks |
| Deployment | Vercel |
| Rate limiting | Upstash Redis when configured, in-memory fallback for development |

## Notable code paths

```text
src/app/api/book/                    Booking and server-side order pricing
src/app/api/checkout/                Idempotent Stripe Checkout creation
src/app/api/stripe/webhook/          Signature verification and payment state transition
src/app/donation/                    Donation workflow
src/app/admin/orders/                Order operations and reconciliation export
src/app/admin/risk/                  Operational risk dashboard
src/lib/rateLimit.ts                 Rate-limit implementation
src/lib/supabaseAdmin.ts             Server-side database access
```

## Local development

```bash
pnpm install
pnpm dev
```

The application requires environment variables for Supabase, Stripe, the public site URL, and email delivery. Use non-production credentials locally and never commit secrets.

