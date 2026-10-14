# 02 — Folder Structure

**Rule:** if you have to ask where something goes, the answer is here. Every top-level page folder is numbered from 1: nav or sidebar order, then pages outside the nav. Folders inside a numbered group are not numbered. Auth is always `1.auth`, inside the dashboard that owns it.

```
QVfits/
├── docs/                    ← every .md doc (README, 01–06)
├── deploy/nginx/            ← qvfits.conf: SPA fallback + /api proxy (06-deployment.md)
├── public/                  ← favicons, icons/, manifest, robots.txt, sitemap.xml, og-image.png,
│                              logo/ (the supplied QV FITS lockups), photos/ (from Quivogue)
├── index.html               ← title, meta, Quivogue fonts
├── vite.config.js           ← @ alias, Tailwind, /api dev proxy → :5000
├── tsconfig.json  eslint.config.js  .env.example  package.json
└── src/
    ├── main.jsx  App.jsx  AppProviders.jsx  index.css (Tailwind + token map)  vite-env.d.ts
    ├── styles/quivogue.css        ← Quivogue's stylesheet, whole (04-design-system.md)
    ├── routes/
    │   ├── SiteRoutes.jsx  SiteLayout.jsx  SitePages.jsx (lazy barrel)
    │   ├── AuthRoutes.jsx         ← /login, /signup, /forgot-password (full screen)
    │   ├── AccountRoutes.jsx      ← /account/*
    │   └── AdminRoutes.jsx        ← /admin/*
    ├── store/                     ← all data access; see 03-data-layer.md
    │   ├── context/               ← CustomerAuthContext, AdminAuthContext, Cart, Currency, Wishlist
    │   └── tanstackStore/         ← queryClient, persist, notices, queries/, services/
    ├── data/                      ← fixtures; only services import these (shop.js = Quivogue data.js)
    ├── utils/                     ← cn, storage, format, formatCurrency, stockLevel, orderStatus,
    │                                media, whatsapp, useClickOutside
    ├── seo/                       ← useSeo (title, description, noindex)
    ├── components/                ← shared by the site; neither dashboard owns these
    │   ├── layout/                ← navbar/ (index, NavLinks, SearchPanel, MenuPanel, Logo, navbarMenu),
    │   │                            footer/, PromoBar, SideDrawer, PageIntro, ScrollToTop, NotFound,
    │   │                            QueryErrorBoundary
    │   ├── ui/                    ← Button, Field, Modal, ConfirmDialog, PageLoader, NetworkStatus (toasts),
    │   │                            EmptyState, StatusChip, Accordion, Reveal
    │   ├── storefront/            ← Photo, ProductCard, ProductGrid, PriceTag, CurrencyPicker,
    │   │                            CartPanel, WishlistPanel
    │   └── assistant/             ← FitAssistant (Vee), AssistantMark
    ├── pages/                     ← the public storefront
    │   ├── 1.home/  2.shop/  3.about/  4.size-guide/  5.contact/
    │   ├── 6.cart/                ← cart, checkout, order-confirmed, track-order
    │   └── 7.legal/               ← privacy, terms, returns, delivery; content/ (the policy text,
    │                                built from the shop settings), sections/ (LegalDocument, Blocks)
    ├── CustomerDashboard/         ← /account; directly in src/, never inside pages/
    │   ├── CustomerLayout.jsx  CustomerPages.jsx (lazy barrel)
    │   ├── components/            ← auth/ (RequireCustomer, AuthShell, useRedirectIfSignedIn), AccountMenu
    │   ├── lib/                   ← accountMenuItems.js
    │   └── pages/
    │       ├── 1.auth/            ← login, signup, forgot-password, schemas
    │       ├── 2.profile/  3.orders/  4.wishlist/  5.addresses/  6.settings/
    └── AdminDashboard/            ← /admin; directly in src/, never inside pages/
        ├── AdminLayout.jsx  AdminPages.jsx (lazy barrel)
        ├── components/            ← auth/ (RequireAdmin, AuthCard), header/, sidebar/, PageHeader,
        │                            Panel, AdminTable, StatCard
        ├── lib/                   ← constants.jsx (ADMIN_NAV), media.js (WebP ladder)
        └── pages/
            ├── 1.auth/            ← admin-login, admin-invite, schemas
            ├── 2.overview/
            ├── 3.catalog/         ← group: products/ categories/ inventory/ reviews/ shared/
            ├── 4.sales/           ← group: orders/ customers/ discounts/ transactions/
            ├── 5.marketing/       ← group: offers/ newsletter/
            ├── 6.website/         ← group: home-content/ faq/
            ├── 7.team/
            └── 8.settings/        ← delivery fees, shop details, payments, currencies
```

## Routes

| URL | Folder |
|---|---|
| `/` | `pages/1.home/home.jsx` |
| `/shop`, `/product/:slug` | `pages/2.shop/shop.jsx`, `product.jsx` |
| `/about`, `/size-guide`, `/contact` | `pages/3.about/`, `4.size-guide/`, `5.contact/` |
| `/cart`, `/checkout`, `/order/:ref`, `/track-order` | `pages/6.cart/` |
| anything else | `components/layout/NotFound.jsx`, inside the storefront chrome |
| `/privacy`, `/terms`, `/returns`, `/delivery` | `pages/7.legal/` |
| `/login`, `/signup`, `/forgot-password` | `CustomerDashboard/pages/1.auth/` |
| `/account`, `/account/orders[/:id]`, `/account/wishlist`, `/account/addresses`, `/account/settings` | `CustomerDashboard/pages/2–6` |
| `/admin/login`, `/admin/invite` | `AdminDashboard/pages/1.auth/` |
| `/admin`, `/admin/products`, `/admin/orders` … | `AdminDashboard/pages/2–8` |

Checkout is guest-friendly: signing in is offered, never required.

## The dashboards never mix (binding)

`AdminDashboard/` and `CustomerDashboard/` are two separate apps that happen to share a repo.

- Neither imports the other. Each has its own `components/`, `lib/`, layout, lazy barrel, auth guard and `1.auth`.
- Neither imports `src/pages/**`, and site pages and `src/components/**` import neither dashboard.
- Code two of them need goes **down**, to `src/components/`, `src/utils/` or `src/store/`. Never sideways.
- Each has its own auth realm: `CustomerAuthContext` (`qvfits:auth:customer`) and `AdminAuthContext` (`qvfits:auth:admin`). Signing out of one leaves the other signed in.
- Only `src/routes/*` and `App.jsx` reference both, to mount them.

`eslint.config.js` enforces all of this with `no-restricted-imports`. A violation fails `npm run lint`.

## Inside a page folder

```
pages/2.shop/
├── shop.jsx                  ← page file, lowercase, default export
├── product.jsx               ← extra routed page of the same section, kebab-case
└── sections/
    ├── Deals.jsx             ← PascalCase components
    ├── shopFilters/          ← camelCase feature groups
    └── productBuyPanel/
```

Section names follow the Quivogue page they port (`04-design-system.md`).

## Where does it go?

| You are adding… | Put it in |
|---|---|
| A storefront page in the nav | `pages/<n>.<name>/` + `navbarMenu.js` + `SitePages.jsx` + `SiteRoutes.jsx` |
| A storefront page outside the nav | the next number after the nav (`pages/7.legal/…`) |
| A customer account page | `CustomerDashboard/pages/<n>.<name>/` + `accountMenuItems.js` + `CustomerPages.jsx` |
| An admin module | `AdminDashboard/pages/<n>.<name>/`, or inside a group (`3.catalog/<name>/`) + `ADMIN_NAV` + `AdminPages.jsx` |
| A component two site pages use | `components/ui/` (generic) or `components/storefront/` |
| A component only the admin uses | `AdminDashboard/components/` |
| A component only the customer area uses | `CustomerDashboard/components/` |
| Something both dashboards need | `components/ui/`, `utils/` or `store/` |
| Data access | `store/tanstackStore/services/<area>/<thing>Api.ts` (+ fixture in `data/`), then a query factory in `queries/site`, `account` or `admin` |
| A pure helper | `utils/` |
| A doc | `docs/NN-kebab.md`, next free number, listed in `docs/README.md` |
