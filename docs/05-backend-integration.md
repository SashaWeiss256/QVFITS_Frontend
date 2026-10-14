# 05 — Backend Integration

**Rule:** the API is a separate repo, `qvfits-api`. This site is built against the contract below on mock data, and each service switches to HTTP one area at a time, with no screen changes.

## The API

| Need | Choice |
|---|---|
| Runtime | Node.js LTS, Express + TypeScript |
| Database | MongoDB (DigitalOcean Managed) with Mongoose; daily backups |
| Validation | zod on every body, query and param |
| Auth | JWT access token (15 min) per realm + httpOnly refresh cookie; bcrypt passwords; rate-limited sign-in |
| Files | DigitalOcean Spaces + CDN; Sharp makes the 1200/800/400 WebP ladder |
| Payments | One Ugandan gateway (Flutterwave or Pesapal): MTN MoMo, Airtel Money, cards; payment confirmed by webhook, never by the browser |
| Email | Resend or Brevo: order confirmation, status changes, new-order alert to the shop |
| Hosting | DigitalOcean Droplet, PM2, behind the same Nginx as this site (`06-deployment.md`) |

Structure it as a modular monolith, `src/modules/<domain>/` with `routes · controller · service · repository · schema`, one module per namespace below.

## Base URL

Every call goes to `/api/v1/…`. In production Nginx proxies `/api` to the API on the same origin; locally Vite's dev proxy sends it to `http://localhost:5000`. `VITE_API_BASE_URL` stays empty unless addressing an API directly.

Responses use one envelope: `{ data, meta? }` on success, `{ error: { code, message, details? } }` on failure (`ApiError` in `services/api/error.ts`).

## Realms

| Realm | Who | Sign-in | Routes |
|---|---|---|---|
| `customer` | Shoppers with an account | `POST auth/customer/login`, `signup`, `forgot-password`, `reset-password` | `account/*` |
| `admin` | Owner and staff, with roles (owner, staff) | `POST auth/admin/login`, `accept-invite` | `admin/*` |

An admin route rejects a customer token even when its signature is valid. Guests can browse, check out and track an order with its reference and phone number.

## Namespaces

| Namespace | Public | Customer | Admin |
|---|---|---|---|
| `auth` | — | login, signup, refresh, logout, password reset | login, refresh, logout, invite |
| `catalog` | products (list, filter, detail by slug), categories, collections, size chart, approved reviews | post a review | products, variants, stock per colour/size, photos, categories, collections, reviews moderation |
| `checkout` | quote (lines, delivery, discount code), create order, start payment | same, linked to the account | — |
| `payments` | gateway webhook | — | transactions, refunds |
| `orders` | track by reference + phone | own orders | list, detail, status changes (pending, paid, packed, out for delivery, delivered, cancelled, exchanged) |
| `customers` | — | profile, addresses, wishlist | list, detail, order history |
| `content` | hero slides, looks, movements, press, FAQ, shop details, delivery fees, exchange rates | — | edit all of these |
| `marketing` | active sale and promo bar, newsletter sign-up | — | offers, discount codes, subscribers export |
| `assistant` | fit assistant query over the live catalogue | — | — |
| `reports` | — | — | overview KPIs, revenue and top products by day, week, month |

`services/api/routes.ts` lists these as `API_NAMESPACES`. Exact paths and payloads are agreed with the API repo and added there as each goes live.

## Stock rule

Stock is reduced when a payment is **confirmed** (webhook), not when an order is created, and restored when an order is cancelled. An unpaid order holds nothing.

## Moving a service from mock to HTTP

1. Confirm the route is live on staging and its response matches `services/types.ts`.
2. In the service, replace the `mockApi(…)` call with `http.get/post…` and the route from `routes.ts`, passing `realm` and `signal`.
3. Leave the query hooks and screens untouched. If a screen has to change, the contract has drifted; fix the contract.
4. Run the verifier, click through the screens that read it, and note the change in `docs/README.md`.
