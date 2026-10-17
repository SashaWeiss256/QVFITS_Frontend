# 03: Data Layer

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
    │   ├── site/                ← catalog, content (settings, home, offers, pages, navigation,
    │   │                          FAQ, zones, payment methods), forms, index (usePageCopy …)
    │   ├── account/             ← profile, orders, returns, index
    │   └── admin/               ← collection (useCollection, useDocument, crudResource),
    │                              catalog, sales, website, team, index
    └── services/
        ├── api/                 ← transport (TypeScript)
        ├── types.ts             ← domain types (the contract)
        ├── store/collectionStore.ts ← mock tables and documents
        ├── store/adminCrud.ts   ← list/create/update/remove/reorder with permission + audit
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
| `catalog/` | `productsApi` (records in, expanded views out; kits, best sellers, setup and publish checks, stock and the stock log, draft preview, bulk edits), `attributesApi` (shop groups, categories, terms, colours, sizes, filter layout, the link lookup), `categoriesApi` (facets), `collectionsApi` (the worked-out rails, live kits), `reviewsApi`, `sizeChartApi`, `photos` | site, admin |
| `sales/` | `checkoutApi` (quote with kit pricing, place, record a sale), `ordersApi` (statuses, payments and part payments, unpaid expiry, cancel, customer messages, notes), `discountsApi` (rules, uses counted from orders), `transactionsApi`, `returnsApi` (guest and staff returns, refund due), `reportsApi` (overview and Reports) | site, account, admin |
| `customers/` | `customersApi` (profile, addresses, wishlist, bag, recently viewed; staff notes and tags), `privacyApi` (download my data, close my account, staff erase) | account, admin |
| `content/` | `contentApi` (home page), `pagesApi` (page copy, the built menus), `faqApi`: all three read only, over JSON in the code. Then `settingsApi`, `contactApi` (messages inbox) | site, admin |
| `settings/` | `shippingApi` (delivery zones, fees), `paymentMethodsApi` | site, admin |
| `marketing/` | `offersApi` (sale, promo bar, deals, sticker), `subscribersApi` (double opt-in, welcome email, newsletter settings), `campaignsApi` | site, admin |
| `notifications/` | `outboxApi`: every email the shop would send, until an email service is connected | every area that emails |
| `team/` | `teamStore`, `staffApi` (invites, roles, the last-owner rule) | admin |
| `admin/` | `activityApi` (the audit log every admin write feeds) | admin |
| `auth/` | `customerAuthApi` (stay signed in, confirm email, password reset), `adminAuthApi`, `adminSession` (who is signed in, `can`, `assertCan`) | the two auth contexts, every admin service |
| `assistant/` | `fitAssistantApi` + `vee/` (Quivogue's full intent parser: language, search, looks, reply) over the live catalogue, stock and size chart; replies are blocks (text, product cards, links), never HTML | site |

Every read takes `{ signal }` and passes it on. Admin-only services say `realm: admin` in their header comment.

### The collection store

`createCollection<T>(key, seed, { idPrefix })` gives a service `list / get / create / update / remove / replace / reset` over rows seeded from the JSON in `src/data` and persisted in localStorage under `qvfits:store:v7:<key>` (bump the version when a seed changes shape). `createDocument<T>(key, seed)` does the same for one settings document. Admin edits therefore survive a reload while mocking.

`adminCrud(table, { module, noun, label, prepare, beforeRemove })` wraps a table for the admin: every write checks the signed-in admin's permission for `module` (`assertCan`, a 403 like the API's) and writes a line to the activity log. `beforeRemove` refuses a delete that would break something, such as a colour a product still uses.

### Links and targets

Every stored link (menu links, the Shop mega menu, hero buttons, home tiles, the campaign, rails, reels, deal cards) keeps a **target**, never a typed address. `src/utils/shopTargets.js` is the one place that knows the grammar, after belioras `menuTargets`:

| Target | Address |
|---|---|
| `{}` | `/shop` |
| `{ categories: ["bras"] }` | `/shop/bras` |
| `{ terms: ["run"] }` | `/shop/movement/running` (the term's group slug, then its own) |
| `{ categories: ["bras"], terms: ["run"] }` | `/shop/bras/movement/running` |
| `{ terms: ["run", "high"] }` (two groups) | `/shop/movement/running/fit/high-support` |
| `{ label: "new" }` (or `bestseller`, `sale`, `kits`) | `/shop/new`; with a category, `/shop/sets?show=new` |
| `{ product: id }` / `{ page: "/about" }` | `/product/<slug>` / the page |

Several terms of one group join with `+` (`/shop/movement/swim+lounge`): within a group a product needs any of them, across groups all of them. A link with no target keeps a plain `href` (an outside address, `#newsForm`, or `null` for WhatsApp on a deal).

- **Reads** (`getNavigation`, `getContent`, `getOffers`) fill in each link's `href` from the live slugs (`withHrefs`), so renaming a category, group or term updates every link. The menus drop links to anything switched off.
- **Writes** strip computed hrefs again (`withoutHrefs`); the target is the truth. Admin editors read the stored documents (`…ForEdit`).
- **The shop page** resolves the path back with `resolveShopPath`, and filters with `matchesTarget`, the same function the menus rely on, so a link and a filter always agree. Edits picked together (`show=new,sale,kits`), size, colour, price (`min`, `max`), stock, sort and search stay in the query string. One Edit on its own keeps its own page (`/shop/new`, `/shop/kits`). The old `?badge=New` and `?sale=1` redirect to `show=`.
- **The Shop menu** is never stored: `shopMenuColumns` builds it from the groups set to show in the menu, in order, with their live items (`getNavigation` and the admin's preview both call it).
- **Slugs**: a category's slug and a tags group's slug both sit right after `/shop`, so they never clash; a term's slug is unique within its group. `new`, `bestsellers`, `sale` and `kits` are reserved. The Movement group keeps `for` as an old slug, so `/shop/for/pilates` redirects. A changed slug moves the old one to `previousSlugs`, and old addresses redirect. The pre-path links `?c=Swim` and `?occasion=lounge` redirect too.
- **Guards**: documents holding links register with `registerLinkSource`, so a category or term a link still opens cannot be deleted ("Hiking is linked from the menu (Edits). Change that link first.").
- In the admin, every link field is `components/LinkPicker.jsx`.

### Records and views

Seeds and writes are **records**: relations by id (`categoryId`, `colorIds`, variants per colour and size). Reads return **views** with names filled in and stock summed per size, which is what the API's list endpoints will return. A patch from a screen may carry view fields; the service saves the stored fields only.

### Honest seams

A mock never claims something happened that did not:

- Checkout with mocks on says no payment was taken and offers the WhatsApp order instead, with the payment steps and how long the pieces are held.
- Every email (order updates, account confirm, password reset, newsletter confirm, welcome, campaigns, low stock) waits in the outbox, shown in the admin under Newsletter, Outbox and on each order. Dev builds show the link from the newest email so the flows can be tried.
- The cookie banner says analytics and marketing are not in use yet; `useConsent().allowed(purpose)` gates any script added later.
- The contact form lands in the admin's Messages inbox and says so; no email is sent yet.
- Staff invites hand back the link to share, until the API sends email.
- Placeholder prices and offers are listed in `07-data.md` until the client confirms them.

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

1. Add the seed, `data/things.json`, shaped like the API's table (ids, relations by id), and list it in `07-data.md`.
2. Add the type to `services/types.ts` and the service `services/<area>/thingsApi.ts`: `createCollection<Thing>("things", seed)`, and `adminCrud(things, { module, noun, label })` if the admin edits it. Reads take `{ signal }`.
3. Add the module to `data/permissions.json` and give it to the roles in `data/roles.json`.
4. Add the query factory:
   - Storefront: under `siteRoot` in `queries/site/`, a `useThings` hook in `queries/site/index.ts`.
   - Customer: under `customerRoot(id)` in `queries/account/`.
   - Admin: `crudResource("things", thingsCrud, { noun: "Thing" })` in `queries/admin/<area>.ts`; pages call `useCollection(thingsResource)`. Admin writes refresh the storefront (`siteRoot`) by default.
5. Add the namespace to `api/routes.ts` if it is new, and to `05-backend-integration.md`.
