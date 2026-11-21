# 05: Backend Integration

**Rule:** the API is a separate repo, `qvfits-api`. This site is built against the contract below on mock data, and each service switches to HTTP one area at a time, with no screen changes.

## The API

| Need | Choice |
|---|---|
| Runtime | Node.js LTS, Express + TypeScript |
| Database | MongoDB (DigitalOcean Managed) with Mongoose; daily backups |
| Validation | zod on every body, query and param |
| Auth | JWT access token (15 min) per realm + httpOnly refresh cookie; bcrypt passwords; rate-limited sign-in |
| Files | DigitalOcean Spaces + CDN; Sharp makes the 1200/800/400 WebP ladder |
| Payments | Pesapal: MTN MoMo, Airtel Money, cards; payment confirmed by Pesapal (its IPN, then asked directly), never by the browser |
| Email | Resend or Brevo: order confirmation, status changes, new-order and low-stock alerts to the shop, account confirm and password reset, newsletter confirm, welcome and campaigns. Until then these wait in the mock outbox (`notifications/outboxApi.ts`, Newsletter, Outbox) |
| Hosting | DigitalOcean Droplet, PM2, behind the same Nginx as this site (`06-deployment.md`) |

Structure it as a modular monolith, `src/modules/<domain>/` with `routes · controller · service · repository · schema`, one module per namespace below.

## Base URL

Every call goes to `/api/v1/…`. In production Nginx proxies `/api` to the API on the same origin; locally Vite's dev proxy sends it to `http://localhost:5000`. `VITE_API_BASE_URL` stays empty unless addressing an API directly.

Responses use one envelope: `{ data, meta? }` on success, `{ error: { code, message, details? } }` on failure (`ApiError` in `services/api/error.ts`).

## Realms

| Realm | Who | Sign-in | Routes |
|---|---|---|---|
| `customer` | Shoppers with an account | **live:** `POST auth/customer/login`, `signup`, `confirm-email`, `forgot-password`, `reset-password`, `refresh`, `logout`, `GET me` | **live:** `account/*` |
| `admin` | Owner and staff, with roles (owner, staff) | `POST auth/admin/login`, `accept-invite`; the first owner once, through `setup` | `admin/*` |

An admin route rejects a customer token even when its signature is valid. Guests can browse, check out, and with an order's reference and phone number track it, cancel it while unpaid, or ask for a return.

Shoppers choose "Stay signed in" (on by default). Admin sessions stay per tab and sign out after 30 minutes idle, with a 2 minute warning. Public forms (sign-up, reset, newsletter, contact, return) carry a honeypot field and a minimum fill time; the API should add rate limits.

## Namespaces

| Namespace | Public | Customer | Admin |
|---|---|---|---|
| `auth` | none | login, signup, confirm email, refresh, logout, password reset | **live:** setup (once), login, refresh, logout, me, invite, accept-invite |
| `catalog` | **live:** products (list, filter, detail by slug, by ids), kits, facets, size chart, approved reviews, review submission | none (reviews are written by staff for now) | **live** (`admin/catalog/*`, `admin/uploads`): products and kits, variants, stock per colour/size and the stock log, photos (ImageKit), categories, groups, terms, colours, sizes, filters, reviews, draft preview |
| `checkout` (**live**) | quote (lines, kits, delivery, discount code), create order, start payment | same, linked to the account | record a sale (showroom, WhatsApp; paid on the spot) |
| `payments` (**live**) | Pesapal for MTN, Airtel and card: checkout returns `onlinePayment.redirectUrl`; `POST payments/status` { ref, trackingId } for the return page `/order/:ref/payment`; `POST payments/retry` { ref, trackingId } or { ref, phone }; Pesapal's IPN `payments/pesapal/ipn` | `POST account/orders/:id/pay` | payments and refunds, always against an order; `POST admin/transactions/:reference/check` asks Pesapal now |
| `orders` (**live**) | track, cancel unpaid, ask for a return (reference + phone) | own orders, cancel unpaid, returns | list, detail, status changes (pending, paid, packed, out for delivery, delivered, cancelled, exchanged), part payments, returns and refunds, messages sent |
| `customers` (**live**) | none | profile, addresses, wishlist, bag, recently viewed, download my data, close my account | list, detail, order history, notes and tags, erase on request |
| `content` | shop details (with `onlinePayments`: whether Pesapal is on), delivery fees, exchange rates; **pending:** the home page document (`GET site/home`). Page copy and FAQ are code, not API data | none | edit settings, delivery zones, payment methods; **pending:** the home page (`GET`/`PATCH admin/content/home`, Offers permission) |
| `marketing` | active sale and promo bar, newsletter sign-up, confirm, unsubscribe | newsletter switch | offers, discount codes, subscribers, campaigns, welcome email |
| `assistant` | fit assistant query over the live catalogue; logs each question (text and whether it was answered) | none | Vee's settings and the questions list |
| `reports` | none | none | overview KPIs and the Reports page: sales, orders, products, codes, customers, stock, for any period |

## Home page document (pending on the API)

The admin's **Home page** (Marketing) edits the hero slides, Shop by movement and Seen on you. It is one document, shaped like `src/data/home.json`, read and saved like the Offers document:

- `GET site/home` (public) returns the stored document. Until it exists the shop uses `src/data/home.json` whole, so a 404 is safe.
- `GET admin/content/home` and `PATCH admin/content/home` (admin, Offers permission: `offers` view and edit). The PATCH body holds any of `heroSlides`, `movements`, `feed`, each sent whole; store them over the document and return it. Until these exist the editor shows today's content with saving switched off.
- Pictures are stored as the `Photo` an upload returns (`image`), links as targets (`target`, never an `href`), a reel's clip as `video` (a URL, or `null` for none).
- `POST admin/uploads` must accept `folder: content` (Offers permission) for these photos, and a short video (MP4, WebM or MOV, up to 30 MB) in the same folder, returning `{ url }`.

`services/api/routes.ts` lists these as `API_NAMESPACES`. Exact paths and payloads are agreed with the API repo and added there as each goes live.

## Stock rule

Placing an order holds its stock. An order with nothing paid after `settings.unpaidHoldHours` (default 48) cancels itself and the stock comes back; the mock sweeps this on every read of orders, the API should run it as a job. Cancelling, and receiving a return, also put stock back. Every change is written to the stock log with its reason and order reference.

A refund is never more than what was paid: each returned line's value, less its share of the discount and kit saving, plus delivery only when a whole faulty order comes back. Staff may lower it, with a reason.

## Moving a service from mock to HTTP

1. Confirm the route is live on staging and its response matches `services/types.ts`.
2. In the service, replace the `mockApi(…)` call with `http.get/post…` and the route from `routes.ts`, passing `realm` and `signal`.
3. Leave the query hooks and screens untouched. If a screen has to change, the contract has drifted; fix the contract.
4. Run the verifier, click through the screens that read it, and note the change in `docs/README.md`.
