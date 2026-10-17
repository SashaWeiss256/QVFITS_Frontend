# 01: Code Conventions

**Rule:** read like the code around you. Follow these patterns rather than inventing new ones.

## 1. Files and folders

| Thing | Convention | Example |
|---|---|---|
| Page folder | every page folder numbered, nav pages first, then the rest | `pages/1.home/`, `pages/3.product/`, `pages/9.legal/` |
| Dashboard page folder | numbered, `1.auth` first, then sidebar / account-menu order | `AdminDashboard/pages/3.products/`, `CustomerDashboard/pages/3.orders/` |
| Auth | inside its own dashboard, `pages/1.auth/` | `CustomerDashboard/pages/1.auth/login.jsx`, `AdminDashboard/pages/1.auth/invite.jsx` |
| Page file | lowercase / kebab-case, default export | `product.jsx`, `order-confirmed.jsx` |
| Page-level helper | beside the page file | `7.checkout/CheckoutShell.jsx`, `7.checkout/schemas.js`, `2.shop/useShopFilters.js` |
| Page section | flat in `sections/`, named for what it is, no page prefix, no subfolders | `sections/Hero.jsx`, `sections/SortBar.jsx`, `sections/SizePicker.jsx` |
| Component folder | entry is `index.jsx` inside the folder; big pieces get a camelCase subfolder of name-prefixed parts | `navbar/index.jsx`, `navbar/MegaMenu.jsx` + `navbar/megaMenu/MegaMenuDesktop.jsx` |
| Shared component | `PascalCase.jsx` in `src/components/<area>/` | `components/storefront/ProductCard.jsx` |
| Store file | TypeScript, camelCase | `services/catalog/productsApi.ts`, `queries/site/catalog.ts` |
| Helper | camelCase `.js`, no React | `utils/formatCurrency.js` |
| Fixture | `data/<thing>.js` | `data/products.js` |
| Doc | `docs/NN-kebab.md` | `docs/04-design-system.md` |

Individual files are **never** number-prefixed (no `2.Hero.jsx`). Only folders carry the order.

The number is the position: nav pages first, then the off-nav pages (or, in a dashboard, `1.auth` then the sidebar order). A new page takes its place and the folders after it move up by one. Update the nav source (`navbarMenu.js`, `utils/accountMenuItems.js` or `ADMIN_NAV`) and the lazy barrel (`routes/pages.js`, `CustomerPages.jsx`, `AdminPages.jsx`) together.

## 2. Splitting

- About 250 lines at most per file. Split by responsibility: a table's columns go in `xColumns.jsx`, a form's schema in `xSchema.js`.
- Something two site pages use moves to `src/components/`. Something two admin modules use goes to `AdminDashboard/components/` or `lib/`; the same for `CustomerDashboard/`.
- Something **both dashboards** need goes to `src/components/`, `src/utils/` or `src/store/`. Never import one dashboard from the other.
- A component file exports components only (fast refresh). Constants go in a sibling `.js` file.

## 3. Imports

- Use the `@/` alias everywhere (`@/components/ui/Button`). Relative imports only for siblings inside one feature folder.
- Order: React, then third-party, a blank line, then `@/` imports, then relatives.
- ESLint enforces the layering and isolation rules (`02-folder-structure.md`, `03-data-layer.md`).

## 4. Data flow

`component → query hook → service → api (mock or http)`, all under `src/store/`.

- Storefront data goes through `queries/site` hooks, customer data through `queries/account`, admin data through `queries/admin`.
- Never write a query key in a component; use a factory (`productQueries.list()`).
- Mutations name what they change (`meta.invalidates`) and refetch it; never patch a local copy of server rows.
- Money is stored and sent in **UGX integers**. Other currencies are display only (`utils/formatCurrency.js`).

## 5. Forms

- **Customer-facing forms** (sign in, sign up, reset, checkout, contact, track order): react-hook-form + zod, `zodResolver`, `noValidate` on the `<form>`. Formik and Yup are not used and not installed.
- **Admin forms** keep a working copy with `AdminDashboard/lib/useDraft` (a functional `set` and `patch`, so two changes in one click don't overwrite each other) and save it with `SaveBar`; the services validate again.
- **Lists** in the admin all use TanStack Table through `DataTable`. Small hand-written tables remain where they are fixed grids, not lists: `PermissionMatrix`, `RecentOrders`, `ReportTable`, `VariantMatrix` and `SizeChart`.
- Text fields and dropdowns are pills; the shared `Field` and `.input` already are, so don't restyle them per page.
- Schemas sit beside the form (`schemas.js`, `checkoutSchema.js`).
- Render fields with `components/ui/Field`: label, `aria-invalid`, and an error announced with `role="alert"`.
- Phone numbers are Ugandan by default (`+256`).
- Server errors show above the submit button, never in an `alert()`.

## 6. Styling

- Tailwind v4 utilities on the Quivogue tokens, plus the component classes in `index.css` (`.btn`, `.btn--ghost`, `.wrap`, `.section`, `.kicker`, `.lede`). See `04-design-system.md`.
- Merge conditional classes with `cn()` from `@/utils/cn`.
- Colours come from tokens only; no hex in components. Third-party brand colours are tokens too (`mtn`, `airtel`, `whatsapp`).
- Icons are Lucide. No emoji as icons.

## 7. Comments

Every file reads top to bottom without the reader opening another file. Four kinds of comment, all in plain sentences: no dashes or box-drawing, no emoji.

**File header.** The first line names the file in Title Case: `/* Name */`. Add a source note if it is a port, e.g. `/* Shop Page (port of Quivogue shop.html) */`.

**Block labels.** A Title Case label above each meaningful block in a render: the hero, a form, a list, an empty state, the footer actions.

```jsx
{/* Size Picker */}
```

**Inline notes.** A full sentence above an element whose behaviour or data source is not obvious from the markup: where the data comes from, what a handler does, why an element is hidden, an accessibility choice.

```jsx
<div className="news__photo">
  {/* Reuse the studio photo managed with the site's home-page content. */}
  <Photo photo={content?.aboutPhoto} label="Inside the studio" wide />
</div>
{/* Validation and subscription feedback are handled by onSubmit and shown below. */}
<form noValidate onSubmit={onSubmit}>
```

**Logic notes.** A `//` line above a guard, fallback, derived value, effect, query key or invalidation, or anything to do with money and units. Longer comments explain a decision, e.g. why checkout never requires an account.

```js
// Bounds come from the full catalogue so the price control doesn't shift with filters.
const bounds = priceBounds(products);
```

**Don't comment** what the line already says (`// set the name`), trivial presentational components, or plans that are not in the code. Check every comment against the code it describes before keeping it; a wrong comment is worse than none.
