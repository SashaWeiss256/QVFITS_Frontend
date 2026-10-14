# 01 — Code Conventions

**Rule:** read like the code around you. Follow these patterns rather than inventing new ones.

## 1. Files and folders

| Thing | Convention | Example |
|---|---|---|
| Numbered page folder | `<n>.<lowercase>`, from 1: nav or sidebar order, then off-nav pages | `pages/2.shop/`, `AdminDashboard/pages/3.catalog/` |
| Auth | always `1.auth`, inside the dashboard it belongs to | `CustomerDashboard/pages/1.auth/`, `AdminDashboard/pages/1.auth/` |
| Folder inside a numbered group | not numbered | `3.catalog/products/`, `4.sales/orders/` |
| Page file | lowercase / kebab-case, default export | `product.jsx`, `order-confirmed.jsx` |
| Page-private parts | `sections/`, PascalCase components, camelCase helpers | `sections/HeroSlideshow.jsx`, `sections/shopFilters/filterOptions.js` |
| Feature group inside sections | camelCase folder | `sections/productBuyPanel/`, `sections/checkoutForm/` |
| Shared component | `PascalCase.jsx` in `src/components/<area>/` | `components/storefront/ProductCard.jsx` |
| Store file | TypeScript, camelCase | `services/catalog/productsApi.ts`, `queries/site/catalog.ts` |
| Helper | camelCase `.js`, no React | `utils/formatCurrency.js` |
| Fixture | `data/<thing>.js` | `data/products.js` |
| Doc | `docs/NN-kebab.md` | `docs/04-design-system.md` |

Individual files are **never** number-prefixed (no `2.Hero.jsx`). Only folders carry the order.

The number is the position in the nav. A new page or module takes its place in the nav and the folders after it move up by one. Update the nav source (`navbarMenu.js`, `accountMenuItems.js` or `ADMIN_NAV`) and the lazy barrel together.

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

- react-hook-form + zod, `zodResolver`, `noValidate` on the `<form>`.
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

```jsx
{/* Size Picker */}
```

Title case, no dashes or box-drawing, no emoji. A file starts with `/* Name */`. Longer comments explain a decision, e.g. why checkout never requires an account.
