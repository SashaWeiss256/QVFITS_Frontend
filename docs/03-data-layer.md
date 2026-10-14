# 03 — Data Layer

**Rule:** the UI asks a query hook. The hook asks a service. The service decides whether the answer comes from a fixture or the API. Swapping one for the other changes the service file only.

## Layers

```
component ──▶ query hook (queries/site, account, admin) ──▶ service ──▶ api/mock.ts   (today)
                                                                     └─▶ api/client.ts (http, when a route is live)
```

ESLint enforces the direction:

- UI (`pages/`, `components/`, `CustomerDashboard/`, `AdminDashboard/`) may import `store/tanstackStore/queries/**` and `store/context/**`. It may not import services, the transport or `src/data`.
- Queries import services, never screens.
- The transport imports nothing above it, and no React.

```
src/store/
├── context/
│   ├── CustomerAuthContext.jsx  ← the signed-in shopper (realm: customer)
│   ├── AdminAuthContext.jsx     ← the signed-in staff member (realm: admin)
│   ├── CartContext.jsx          ← lines, quantities, subtotal; persisted per device
│   ├── CurrencyContext.jsx      ← display currency; prices stay UGX underneath
│   └── WishlistContext.jsx      ← local for guests, synced to the account once signed in
└── tanstackStore/
    ├── queryClient.ts           ← defaults, notices, meta.invalidates
    ├── persist.ts               ← persists ["site", …] queries to localStorage
    ├── notices.ts               ← "couldn't refresh" messages
    ├── queries/
    │   ├── keys.ts              ← realm roots: siteRoot, customerRoot, adminRoot
    │   ├── site/                ← catalog, content, checkout, forms, index
    │   ├── account/             ← profile, orders, addresses, wishlist, index
    │   └── admin/               ← collection (useCollection/useDocument), catalog, sales,
    │                              marketing, website, team, settings, overview, index
    └── services/
        ├── api/                 ← transport (TypeScript)
        ├── types.ts             ← domain types (the contract)
        ├── store/collectionStore.ts ← mock tables and documents
        └── <area>/<thing>Api.ts
```

## `services/api/` (transport; knows nothing about the domain)

| File | Role |
|---|---|
| `config.ts` | Base URL, version, timeout, `useMockApi`; `apiUrl(path, params)` |
| `client.ts` | `http.get/post/patch/put/del/list<T>`. Every call names a realm (`customer` or `admin`) and sends that realm's bearer token. A 401 clears that realm's token only |
| `tokens.ts` | One token slot per realm and `onTokenChange` |
| `error.ts` | `ApiError` with `status`, `code`, `fieldErrors`. Mirrors the API error body `{ error: { code, message, details } }` |
| `mock.ts` | `mockApi(resolver, ms, signal)`; throws the same `ApiError` and honours an `AbortSignal` |
| `routes.ts` | `API_NAMESPACES` and the `routes` that are live |
| `types.ts` | `Realm`, `Id`, `Envelope`, `Page`, `ErrorBody`, `RequestOptions` |

## `services/` (one folder per business area)

| Area | Files | Used by |
|---|---|---|
| `catalog/` | `productsApi`, `categoriesApi`, `collectionsApi`, `reviewsApi`, `sizeChartApi` | site, admin |
| `sales/` | `checkoutApi`, `ordersApi`, `paymentsApi`, `discountsApi`, `reportsApi` | site, account, admin |
| `customers/` | `customersApi`, `addressesApi` | account, admin |
| `content/` | `contentApi` (hero, looks, movements, press, FAQ), `settingsApi` (delivery, shop details), `contactApi` | site, admin |
| `marketing/` | `offersApi` (sale, promo bar, sticker), `subscribersApi` | site, admin |
| `auth/` | `customerAuthApi`, `adminAuthApi` | the two auth contexts |
| `assistant/` | `fitAssistantApi` (Quivogue's intent parser over the live catalogue) | site |

Every read takes `{ signal }` and passes it on. Admin-only services say `realm: admin` in their header comment.

### The collection store

`createCollection<T>(key, seed, { idPrefix })` gives a service `list / get / create / update / remove / reset` over rows seeded from `src/data` and persisted in localStorage under `qvfits:store:v2:<key>` (bump the version when a seed changes shape). `createDocument<T>(key, seed)` does the same for one settings document. Admin edits therefore survive a reload while mocking.

### Honest seams

A mock never claims something happened that did not:

- Checkout with mocks on says no payment was taken and offers the WhatsApp order instead.
- The contact form and newsletter say delivery is not connected yet.
- Placeholder prices are flagged in the fixture (`// PRICE TBC`) until the client confirms them.

## Realms and keys

| Realm | Key root | Persisted | Cleared |
|---|---|---|---|
| site | `["site", …]` | yes | on deploy (`__APP_BUILD__`) |
| customer | `["customer", customerId, …]` | no | on customer sign-out |
| admin | `["admin", …]` | no | on admin sign-out |

## Money

- All amounts are **UGX integers**, in fixtures, services and the API.
- `CurrencyContext` only changes what is displayed. Rates come from `settingsApi` (later the API's daily rates), not a hard-coded table.
- An order is always quoted and charged in UGX, whatever currency is on screen.

## Adding a resource

1. Add the fixture, `data/things.js`.
2. Add the type to `services/types.ts` and the service `services/<area>/thingsApi.ts`. Use `createCollection<Thing>` if the admin edits it. Reads take `{ signal }`.
3. Add the query factory:
   - Storefront: `thingQueries` in `queries/site/<area>.ts` under `siteRoot`, a `useThings` hook in `queries/site/index.ts`.
   - Customer: under `customerRoot(id)` in `queries/account/`.
   - Admin: `collectionQueries("things", listThings)` and a `thingsResource` in `queries/admin/<area>.ts`; pages call `useCollection(thingsResource)`.
4. If an admin write changes something the storefront shows, list that key in the resource's `alsoInvalidates`.
5. Add the namespace to `api/routes.ts` if it is new, and to `05-backend-integration.md`.
