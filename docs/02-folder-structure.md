# 02: Folder Structure

**Rule:** if you have to ask where something goes, the answer is here. Pages follow `stream.theartistry360/src/pages`:

- **Every page folder is numbered**, in nav order and then the off-nav pages (`1.home` … `9.legal`). Dashboard pages are numbered too, and each dashboard starts with its own sign-in, `1.auth`, followed by its sidebar or account-menu order.
- **Sign-in lives with its realm:** the shopper's sign-in is `CustomerDashboard/pages/1.auth/`, the staff sign-in `AdminDashboard/pages/1.auth/`. `src/pages/` has no auth.
- **The page file sits in its folder** (`2.shop/shop.jsx`), next to its page-level helpers: a shell, schemas, a hook (`7.checkout/CheckoutShell.jsx`, `7.checkout/schemas.js`, `2.shop/useShopFilters.js`).
- **Sections are flat and plainly named:** each section is one file in `sections/`, named for what it is (`ShopToolbar.jsx`, `Gallery.jsx`, `SizePicker.jsx`), without the page's name in front. **No folders inside `sections/`** unless there is truly no other way.
- `pages/not-found.jsx` sits at the root of `pages/`. Page copy lives in `data/pages.json`, part of the code (no dashboard); the policy builders in `9.legal/content/` take the live settings.
- **Home sections stay few:** the home page has one file per real section (client request: not split too far).

```
QVfits/
├── docs/                    ← every .md doc (README, 01 to 07)
├── scripts/                 ← check-dashes.mjs (run by npm run lint)
├── deploy/nginx/            ← qvfits.conf: SPA fallback + /api proxy (06-deployment.md)
├── public/                  ← favicons, icons/, manifest, robots.txt, sitemap.xml, og-image.png,
│                              logo/ (the QVFITS logo files: see 04-design-system.md, Logo), photos/ (from Quivogue)
├── index.html  vite.config.js  tsconfig.json  eslint.config.js  .env.example  package.json
└── src/
    ├── main.jsx  App.jsx  AppProviders.jsx  index.css  vite-env.d.ts
    ├── styles/                    ← quivogue.css (base, colours, the home page sections),
    │                                theme.css (type, surfaces, cards), chrome.css (logo,
    │                                header, mega menu, overlays)
    ├── routes/                    ← SiteRoutes, SiteLayout, pages.js (the storefront's lazy
    │                                barrel), AuthRoutes, AccountRoutes, AdminRoutes
    ├── store/                     ← all data access (03-data-layer.md)
    ├── data/                      ← the JSON seeds, one file per entity (07-data.md)
    ├── utils/  seo/
    ├── components/                ← shared by the site; neither dashboard owns these
    │   ├── layout/                ← Footer (with the newsletter band), PromoBar, SideDrawer,
    │   │                            CookieConsent, PageIntro, ScrollToTop, useOverlayFlag · navbar/index.jsx + Logo, MegaMenu (megaMenu/),
    │   │                            SearchOverlay (searchOverlay/), MobileMenu (mobileMenu/)
    │   ├── motion/                ← Reveal, RevealGroup, RevealItem (m components, LazyMotion)
    │   ├── ui/  assistant/
    │   ├── storefront/            ← ProductCard, ProductGrid, NewsletterForm, PaymentDue,
    │   │                            RecentlyViewed, CartPanel, WishlistPanel …
    ├── pages/                     ← the storefront, every folder numbered
    │   ├── 1.home/                ← home.jsx · sections/ Hero, Press, ProductRail, Movements,
    │   │                            Campaign, Feed, Newsletter (the original Quivogue home)
    │   ├── 2.shop/                ← shop.jsx, useShopFilters.js, useGridSize.js, filterProducts.js
    │   │                            sections/ ShopToolbar, FilterDrawer, SortMenu, PriceRange,
    │   │                            FilterChips, Kits, Deals …
    │   ├── 3.product/             ← product.jsx · sections/ Gallery, BuyPanel, ColorPicker, SizePicker …
    │   ├── 4.about/  5.size-guide/  6.contact/
    │   ├── 7.checkout/            ← cart, checkout, order-confirmed, CheckoutShell, schemas,
    │   │                            orderMessage, useCheckoutBag · sections/
    │   ├── 8.track-order/         ← track-order.jsx · sections/ LookupForm, GuestReturn
    │   ├── 9.legal/               ← legal.jsx (all four policies) · content/ · sections/Blocks
    │   ├── 10.newsletter/         ← confirm.jsx, unsubscribe.jsx (the double opt-in links)
    │   └── not-found.jsx
    ├── CustomerDashboard/         ← /account; CustomerLayout, CustomerPages (lazy barrel)
    │   ├── components/            ← auth/RequireCustomer, AccountMenu
    │   └── pages/                 ← 1.auth (login, signup, forgot-password, reset-password,
    │                                confirm-email, AuthShell, schemas)
    │                                2.profile  3.orders  4.wishlist  5.addresses  6.settings
    └── AdminDashboard/            ← /admin; AdminLayout, AdminPages (lazy barrel)
        ├── components/            ← auth/RequireAdmin, header/, sidebar/, PermissionGate, DataTable,
        │                            Drawer, ImageUploader, ListEditor, ProductPicker, SaveBar, Tabs,
        │                            TagInput, Toggle, PageHeader, Panel, StatCard
        ├── lib/                   ← constants.jsx (ADMIN_NAV with permissions), useTable, useDraft,
        │                            useTab (?tab=), useUrlFilters, useIdleTimeout, csv.js, media.js
        └── pages/                 ← 1.auth (login, invite) 2.overview 3.reports
                                     Catalog: 4.products (tabs Products, Stock, Reviews; + product-edit
                                     for pieces and kits) 5.categories (Shop by groups, colours, Menu, Filter and sort)
                                     6.size-guide (chart, sizes)
                                     Sales: 7.orders (tabs Orders, Returns and refunds)
                                     8.transactions 9.customers 10.messages
                                     Marketing: 11.discounts 12.offers 13.newsletter (tabs Subscribers,
                                     Campaigns, Welcome email, Outbox) 14.vee (Settings, Questions)
                                     Admin: 15.team 16.settings 17.activity
```

## Routes

| URL | Folder |
|---|---|
| `/` | `pages/1.home/home.jsx` |
| `/shop`, `/shop/:category`, `/shop/:group/:term`, `/shop/:category/:group/:term`, `/shop/new`, `/shop/bestsellers`, `/shop/sale`, `/shop/kits` | `pages/2.shop/shop.jsx`; the path is resolved by `utils/shopTargets.js` (03, Links and targets) |
| `/product/:slug` (`?preview` lets signed-in staff see a draft) | `pages/3.product/product.jsx` |
| `/about`, `/size-guide`, `/contact` | `pages/4.about/`, `5.size-guide/`, `6.contact/` |
| `/cart`, `/checkout`, `/order/:ref` | `pages/7.checkout/` |
| `/track-order` | `pages/8.track-order/track-order.jsx` |
| `/privacy`, `/terms`, `/returns`, `/delivery` | `pages/9.legal/legal.jsx` (the policy comes from the URL) |
| `/newsletter/confirm`, `/newsletter/unsubscribe` | `pages/10.newsletter/` |
| anything else | `pages/not-found.jsx`, inside the storefront chrome |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/account/confirm` | `CustomerDashboard/pages/1.auth/` |
| `/account`, `/account/orders[/:id]`, `/account/wishlist`, `/account/addresses`, `/account/settings` | `CustomerDashboard/pages/2` to `6` |
| `/admin/login`, `/admin/invite` | `AdminDashboard/pages/1.auth/` |
| `/admin`, `/admin/reports`, `/admin/products[/new, /:id]`, `/admin/orders` … `/admin/activity` | `AdminDashboard/pages/2` to `17`, each behind its permission (`routes/AdminRoutes.jsx`). A tab opens by address (`/admin/orders?tab=returns`, `?order=<id>` opens an order) |
| `/admin/inventory`, `/reviews`, `/returns`, `/collections`, `/website`, `/pages`, `/faq` | Old addresses, redirected (`MOVED` in `AdminRoutes.jsx`) |

Checkout is guest-friendly: signing in is offered, never required.

## The dashboards never mix (binding)

`AdminDashboard/` and `CustomerDashboard/` are two separate apps that happen to share a repo.

- Neither imports the other. Each has its own `components/`, `lib/`, layout, lazy barrel and auth guard. Each keeps its own sign-in pages in `pages/1.auth/`.
- Neither imports `src/pages/**`, and site pages and `src/components/**` import neither dashboard.
- Code two of them need goes **down**, to `src/components/`, `src/utils/` or `src/store/`. Never sideways.
- Each has its own auth realm: `CustomerAuthContext` (`qvfits:auth:customer`) and `AdminAuthContext` (`qvfits:auth:admin`). Signing out of one leaves the other signed in.
- Only `src/routes/*` and `App.jsx` reference both, to mount them.

`eslint.config.js` enforces all of this with `no-restricted-imports`. A violation fails `npm run lint`.

## Inside a page folder

```
pages/7.checkout/
├── checkout.jsx              ← page file, lowercase, default export
├── cart.jsx                  ← another routed page of the same flow, kebab-case
├── CheckoutShell.jsx         ← page-level helpers sit beside the pages
├── schemas.js
├── useCheckoutBag.js
└── sections/                 ← flat: one file per section, plain names
    ├── Steps.jsx
    ├── DeliveryForm.jsx
    └── OrderSummary.jsx
```

A section that grows is split into more flat files in `sections/` (`BuyPanel.jsx`, `ColorPicker.jsx`, `SizePicker.jsx`, `MobileAddBar.jsx`), not into a subfolder.

## Where does it go?

| You are adding… | Put it in |
|---|---|
| A storefront page | `pages/<n>.<name>/` (next number; nav pages first) + `routes/pages.js` + `SiteRoutes.jsx`; its copy in `data/pages.json`, and a link in `data/navigation.json` if it is in a menu |
| A customer account page | `CustomerDashboard/pages/<n>.<name>/` + `accountMenuItems.js` + `CustomerPages.jsx` |
| An admin module | `AdminDashboard/pages/<n>.<name>/` (flat, sidebar order) + `ADMIN_NAV` (with its `perm`) + `AdminPages.jsx` + `routes/AdminRoutes.jsx` + a module in `data/permissions.json` |
| A component two site pages use | `components/ui/` (generic) or `components/storefront/` |
| A component only the admin uses | `AdminDashboard/components/` |
| A component only the customer area uses | `CustomerDashboard/components/` |
| Something both dashboards need | `components/ui/`, `utils/` or `store/` |
| Data access | `store/tanstackStore/services/<area>/<thing>Api.ts` (+ a JSON seed in `data/`), then a query factory in `queries/site`, `account` or `admin` |
| Words on a page | `data/pages.json`, read with `usePageCopy("page")`; never typed into JSX |
| A pure helper | `utils/` |
| A doc | `docs/NN-kebab.md`, next free number, listed in `docs/README.md` |
