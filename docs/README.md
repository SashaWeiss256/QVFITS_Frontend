# QV fits — Build Breakdown & Status Tracker

The rebuild of **qvfits.com**, the online shop for QV fits (seamless activewear, swim and lounge wear; showroom at THE CUBE, G17 Kisementi, Kampala). It replaces the static site in `Quivogue/quivogue` with a MERN-stack shop: the public storefront, a customer account area at `/account`, and the admin dashboard at `/admin`.

Vite + React 19 + Tailwind v4 + React Router 7 + TanStack Query + Lucide, with a TypeScript store layer. Until the API is live, everything runs on mock data in `src/data/`, reached **only** through `src/store/tanstackStore/services/`.

The API is a separate repo, `qvfits-api` (Express + MongoDB), hosted on DigitalOcean with this site (`06-deployment.md`).

## Where each part comes from

| Source | We take | We do not take |
|---|---|---|
| `Quivogue/quivogue` | **The UI**: tokens, fonts, chrome, page sections, look (`04-design-system.md`) | Static HTML, Supabase |
| `the_artistry360_2024` | Skeleton and rules: numbered folders, `src/store/`, lazy barrels, ESLint layering, these docs | Its visual style, Netlify |
| `belioras` | E-commerce domains: admin modules, customer accounts, catalog / sales / marketing services, cart and currency contexts | Its visual style; its customer dashboard importing admin code |

## Golden Rules

1. **The UI is Quivogue's.** Colours, type, spacing and section layouts come from `Quivogue/quivogue/css/style.css` and its pages. Nothing visual is borrowed from Artistry or Belioras.
2. **Backend-ready.** UI never imports `src/data/`, a service or the transport. Always component → query hook → service → api, all under `src/store/` (`03-data-layer.md`). ESLint enforces it.
3. **The dashboards never mix.** `AdminDashboard/` and `CustomerDashboard/` never import each other. Shared code goes down to `components/`, `utils/` or `store/`, never sideways (`02-folder-structure.md`). ESLint enforces it.
4. **Numbering starts at 1.** Every top-level page folder is numbered: nav or sidebar order first, then off-nav pages. Where a dashboard has auth it is always `1.auth`, and it lives inside that dashboard.
5. **Split rule.** Files stay under ~250 lines. A page's private parts go in its `sections/`; anything two pages use goes in `src/components/`.
6. **Comment style.** `{/* Section Name */}` above blocks, title case, no decoration. A file-top `/* Name */` line. Explain *why*, not what.
7. **Accessibility floors** carried over from the Quivogue audit: tap targets ≥ 44px, ink contrast ≥ 4.5:1, exactly one `h1` per page, width and height on every image, `prefers-reduced-motion` respected.
8. **Code splitting.** Every page and dashboard module is `React.lazy`.

## Build Order (Phases)

Delivery is 15 working days (proposal QV-2026-001).

| # | Phase | Doc | Days | Status |
|---|---|---|---|---|
| 0 | Config, dependencies, docs | this folder | 1 | done |
| 1 | Store layer (api, services, queries, fixtures) | `03-data-layer.md` | 1–3 | done (mock) |
| 2 | Design foundation (tokens, chrome, UI kit) | `04-design-system.md` | 1–3 | done |
| 3 | Shell, routes, both auth realms | `02-folder-structure.md` | 2–3 | done (mock sign-in) |
| 4 | Storefront pages ported from Quivogue | `04-design-system.md` | 4–11 | in-progress: hero slideshow, shop, product, bag and the four policies done; responsive audit passed (320px to 4K TV); the other home sections, about, contact form, size guide extras and checkout to port |
| 5 | Customer dashboard | `02-folder-structure.md` | 6–9 | in-progress: sign-up, sign-in, orders, saved pieces, addresses read; edit forms to build |
| 6 | Admin dashboard | `02-folder-structure.md` | 4–11 | in-progress: overview, products, orders, customers, discounts read; forms and the other modules to build |
| 7 | Backend integration (payments, email) | `05-backend-integration.md` | 8–12 | pending |
| 8 | DigitalOcean deploy | `06-deployment.md` | 2–3, 15 | pending |
| 9 | QA, client review, launch | — | 12–15 | pending |

**Blocking launch (client):**

- All 16 prices, delivery fees, the exchange window (7 days, in Settings) and showroom hours are still placeholders.
- The payment gateway merchant account needs approval in QV fits' name.
- Product photos are Unsplash placeholders (`src/data/productImages.js`) until the shop's own photography arrives.
- The privacy policy, terms, exchanges and delivery policies (`src/pages/7.legal/content/`) need review by the shop's lawyer, and QV fits must register as a data controller with Uganda's Personal Data Protection Office (PDPO).

## Status Legend

- `pending`: not started
- `in-progress`: being worked on
- `done`: complete and verified (lint, typecheck, build and a browser run)

## Docs

| Doc | What it covers |
|---|---|
| `01-code-conventions.md` | Naming, splitting, imports, forms, styling, comments |
| `02-folder-structure.md` | Where everything lives; the dashboard isolation rule |
| `03-data-layer.md` | `src/store/`: transport, services, queries, mocks, realms |
| `04-design-system.md` | Quivogue tokens, type, component classes, porting a section |
| `05-backend-integration.md` | The `qvfits-api` contract and moving a service from mock to HTTP |
| `06-deployment.md` | DigitalOcean, Nginx, PM2, Spaces, DNS on IONOS |

New docs take the next free number (`NN-kebab.md`) and are listed here.

## Verifier

After every phase:

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 errors
npm run build
```

Mock sign-ins are in the root `README.md`. For UI work, also click through the changed routes in `npm run dev` at 375px and 1280px, side by side with the same Quivogue page.
