# 02: Folder Structure

**Rule:** if you have to ask where something goes, the answer is here. Pages follow `stream.theartistry360/src/pages`:

- **Every page folder is numbered**, in nav order and then the off-nav pages (`1.home` … `9.legal`). Dashboard pages are numbered too, and each dashboard starts with its own sign-in, `1.auth`, followed by its sidebar or account-menu order.
- **Sign-in lives with its realm:** the shopper's sign-in is `CustomerDashboard/pages/1.auth/`, the staff sign-in `AdminDashboard/pages/1.auth/`. `src/pages/` has no auth.
- **The page file sits in its folder** (`2.shop/shop.jsx`), next to its page-level helpers: a shell, schemas, a hook (`7.checkout/CheckoutShell.jsx`, `7.checkout/schemas.js`, `2.shop/useShopFilters.js`).
- **Sections are flat and plainly named:** each section is one file in `sections/`, named for what it is (`SortBar.jsx`, `Gallery.jsx`, `SizePicker.jsx`), without the page's name in front. **No folders inside `sections/`** unless there is truly no other way.
- `pages/not-found.jsx` sits at the root of `pages/`. Page copy lives in `data/pages.json`; the policy builders in `9.legal/content/` take the live settings.
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
    │   ├── layout/                ← Footer, PromoBar, SideDrawer, PageIntro, ScrollToTop,
    │   │                            useOverlayFlag · navbar/index.jsx + Logo, MegaMenu (megaMenu/),
    │   │                            SearchOverlay (searchOverlay/), MobileMenu (mobileMenu/)
    │   ├── motion/                ← Reveal, RevealGroup, RevealItem (m components, LazyMotion)
    │   ├── ui/  storefront/  assistant/
    ├── pages/                     ← the storefront, every folder numbered
    │   ├── 1.home/                ← home.jsx · sections/ Hero, Press, ProductRail, Movements,
    │   │                            Campaign, Feed, Newsletter (the original Quivogue home)
    │   ├── 2.shop/                ← shop.jsx, useShopFilters.js, filterProducts.js · sections/
    │   ├── 3.product/             ← product.jsx · sections/ Gallery, BuyPanel, ColorPicker, SizePicker …
    │   ├── 4.about/  5.size-guide/  6.contact/
    │   ├── 7.checkout/            ← cart, checkout, order-confirmed, CheckoutShell, schemas,
    │   │                            orderMessage, useCheckoutBag · sections/
    │   ├── 8.track-order/         ← track-order.jsx · sections/LookupForm
    │   ├── 9.legal/               ← legal.jsx (all four policies) · content/ · sections/Blocks
    │   └── not-found.jsx
    ├── CustomerDashboard/         ← /account; CustomerLayout, CustomerPages (lazy barrel)
    │   ├── components/            ← auth/RequireCustomer, AccountMenu
    │   └── pages/                 ← 1.auth (login, signup, forgot-password, AuthShell, schemas)
    │                                2.profile  3.orders  4.wishlist  5.addresses  6.settings
    └── AdminDashboard/            ← /admin; AdminLayout, AdminPages (lazy barrel)
        ├── components/            ← auth/RequireAdmin, header/, sidebar/, PermissionGate, DataTable,
        │                            Drawer, ImageUploader, ListEditor, ProductPicker, SaveBar, Tabs,
        │                            TagInput, Toggle, PageHeader, Panel, StatCard
        ├── lib/                   ← constants.jsx (ADMIN_NAV with permissions), useTable, useDraft,
        │                            csv.js, media.js
        └── pages/                 ← 1.auth (login, invite) 2.overview
                                     Catalog: 3.products (+ product-edit) 4.categories 5.attributes
                                     6.inventory 7.collections 8.reviews 9.size-guide
                                     Sales: 10.orders 11.returns 12.customers 13.transactions
                                     Marketing: 14.discounts 15.offers 16.newsletter
                                     Website: 17.home-content 18.pages 19.faq 20.messages
                                     Admin: 21.team 22.settings 23.activity
```

## Routes

| URL | Folder |
|---|---|
| `/` | `pages/1.home/home.jsx` |
| `/shop` | `pages/2.shop/shop.jsx` |
| `/product/:slug` | `pages/3.product/product.jsx` |
| `/about`, `/size-guide`, `/contact` | `pages/4.about/`, `5.size-guide/`, `6.contact/` |
| `/cart`, `/checkout`, `/order/:ref` | `pages/7.checkout/` |
| `/track-order` | `pages/8.track-order/track-order.jsx` |
| `/privacy`, `/terms`, `/returns`, `/delivery` | `pages/9.legal/legal.jsx` (the policy comes from the URL) |
| anything else | `pages/not-found.jsx`, inside the storefront chrome |
| `/login`, `/signup`, `/forgot-password` | `CustomerDashboard/pages/1.auth/` |
| `/account`, `/account/orders[/:id]`, `/account/wishlist`, `/account/addresses`, `/account/settings` | `CustomerDashboard/pages/2` to `6` |
| `/admin/login`, `/admin/invite` | `AdminDashboard/pages/1.auth/` |
| `/admin`, `/admin/products[/new, /:id]`, `/admin/orders` … `/admin/activity` | `AdminDashboard/pages/2` to `23`, each behind its permission (`routes/AdminRoutes.jsx`) |

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
