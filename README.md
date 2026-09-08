# Shijia Community Commerce Platform

[Application](https://shijia-site.vercel.app) · [Setup](#local-development) · [Code walkthrough](#notable-code-paths)

Shijia is a Next.js community web application implementing restaurant reservations, menu orders, Stripe payments, donations, email notifications, and back-office operations for a community organization.

The engineering focus is the transaction workflow behind the interface: server-calculated pricing, signed payment events, guarded order state, and staff-facing reconciliation. The code is available for review; this repository does not establish customer counts, transaction volume, or current service availability.

## Product workflows

- Public menu and reservation flow
- Booking-linked orders and Stripe Checkout
- Donation creation, checkout, confirmation, and administration
- Payment and booking email notifications
- Administrative order search, filtering, and CSV export
- Risk dashboard for amount mismatches, stale pending payments, and repeated phone activity

## Reliability and safety

- **Server-authoritative pricing:** item names, availability, and prices are loaded from PostgreSQL rather than trusted from browser input.
- **Idempotent checkout:** Stripe session creation uses an order-based idempotency key. The existing-session lookup still needs a targeted regression test; this is not a claim that every retry path has been verified.
- **Signed webhooks:** Stripe signatures are verified before payment events are processed.
- **State-guarded payment updates:** the webhook code restricts the `pending` to `paid` transition with an order-state condition.
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

Use Node.js 20.9+ and npm. The repository includes `package-lock.json`:

```bash
npm ci
cp .env.example .env.local
# Fill in credentials for a dedicated development environment.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The checked-in environment template contains names and placeholders only. Server credentials must stay in `.env.local`; only `NEXT_PUBLIC_SITE_URL` is intended for the browser.

| Configuration | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Server-side database access |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout and signed payment events; use test mode locally |
| `NEXT_PUBLIC_SITE_URL` | Redirect origin, normally `http://localhost:3000` locally |
| `RESEND_API_KEY`, `RESEND_FROM` | Email provider and verified sender |
| `EMAIL_TO_OVERRIDE` | Route development emails to a test inbox you control |
| `ADMIN_KEY` | Development admin access; choose a nonempty local value |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional shared rate-limit storage |

The published branch does not yet include a complete database bootstrap. Starting Next.js alone is not enough to exercise booking, payments, or admin flows: those routes also require the compatible Supabase schema and external services. Do not guess a production schema from the UI.

## Verification status

```bash
npm run lint
npm run build
```

These are the available static checks, not a claim that they currently pass. This published branch has no automated behavior-test suite or CI workflow yet. End-to-end payment verification requires a dedicated test database, Stripe test credentials, and an isolated email destination.

Useful next regression cases are repeated checkout requests, invalid webhook signatures, repeated payment events, mismatched amounts, and provider timeouts. Real-user and payment-volume claims should be supported separately from these code-level checks.
