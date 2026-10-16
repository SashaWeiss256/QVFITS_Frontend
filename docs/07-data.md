# 07: Data

**Rule:** everything the shop shows lives as JSON in `src/data/`, one file per entity, shaped like the API's tables. Services read the JSON as seeds (`03-data-layer.md`); screens never import it. The admin edits the same rows, and with mocks on those edits persist in the browser under `qvfits:store:v3:<key>`.

Ids are strings. Relations are ids, never names: a product has a `categoryId` and `colorIds`, not "Sets" and "Ivory". Services expand ids into names on the way out, so a renamed colour is renamed everywhere at once.

## Files

| File | Holds | Edited in the admin under |
|---|---|---|
| `products.json` | The catalogue. See below | Catalog, Products and Inventory |
| `categories.json` | `{ id, name, slug, parentId, image, description, position, active }` | Catalog, Categories |
| `colors.json` | `{ id, name, hex, position }`, the swatches | Catalog, Colours, sizes, filters |
| `sizes.json` | `{ id, label, group, position }` | same |
| `activities.json` | `{ id, label, position }`, what you train in (the shop's "Activity" filter) | same |
| `filters.json` | `{ facets: [{ id, label, visible, position }] }`, the shop's filter sidebar | same, Shop filters tab |
| `looks.json` | Kits: `{ id, title, note, items: productId[], position, live }` | Catalog, Rails and kits |
| `reviews.json` | `{ id, productId, name, text, stars, status, createdAt }`; only `approved` show | Catalog, Reviews |
| `size-chart.json` | `{ size, uk, us, eu, bust: [from, to], waist, hip }` in cm | Catalog, Size guide |
| `photos.json` | Generated: photo id → `[width, height, [webp widths]]` for `public/photos` | Not edited by hand |
| `home.json` | Hero slides, the two rails, movements, campaign, press, feed, newsletter box | Website, Home page (rails under Rails and kits) |
| `offers.json` | Sale switch, promo bar lines, deal cards, the sign-up sticker | Marketing, Offers and banners |
| `pages.json` | Headings, text and buttons of every other page, by page | Website, Pages and menus |
| `navigation.json` | Header links, Shop menu shortcuts, help and legal links, popular searches | same, Menus tab |
| `faq.json` | `{ id, q, a, group, position }` | Website, FAQ |
| `settings.json` | Shop details, contact, socials, free delivery threshold, low stock level, exchange window, currencies, Vee | Admin, Settings |
| `shipping-zones.json` | `{ id, name, description, fee, freeOver, etaDays, collect, active, position }` | Settings, Delivery |
| `payment-methods.json` | `{ id, label, short, instructions, active, position }` | Settings, Payments |
| `orders.json` | Orders with `lines`, totals, `paymentStatus`, `history` (timeline), staff `notes` | Sales, Orders |
| `transactions.json` | Payments and refunds, each tied to an order | Sales, Transactions |
| `returns.json` | Return and exchange requests | Sales, Returns |
| `customers.json` | Accounts (mock passwords only), addresses, wishlist, staff notes and tags | Sales, Customers |
| `discounts.json` | Codes. See below | Marketing, Discount codes |
| `subscribers.json`, `messages.json` | Newsletter sign-ups; contact form messages | Marketing, Newsletter; Website, Messages |
| `staff.json`, `roles.json`, `permissions.json` | Team, roles and the modules a role can be given | Admin, Team and roles |
| `activity.json` | The audit log, written by every admin save (starts empty, keeps 500) | Admin, Activity log |

## A product

```
{ id, slug, name, status: "draft" | "active" | "archived",
  categoryId, price, compareAtPrice, salePercent, badge: "New" | "Bestseller" | null,
  colorIds, activityIds, blurb, details[], fit, fitNote, fabric, care,
  variants: [{ id, sku, colorId, size, stock }],
  photos: [{ id, url?, width, height, widths, colorId? }],
  seo: { title, description }, createdAt, updatedAt }
```

- **Stock is per colour and size** (a variant). The storefront view also carries `stock` per size, summed across colours, and the product page narrows it to the colour picked (`utils/stockLevel.js`, `forColor`).
- Placing an order holds its stock; cancelling or receiving a return puts it back.
- Only `active` products reach the shop. Drafts and archived pieces stay in the admin.
- `salePercent` shows only while the sale is switched on in Offers.

## A discount code

```
{ id, code, description, type: "percent" | "fixed" | "free_shipping", value,
  minSpend, startsAt, endsAt, usageLimit, perCustomerLimit, usedCount,
  appliesTo: { scope: "all" | "categories" | "products", ids[] }, active }
```

Checkout prices a code on the service (`sales/discountsApi.ts`, `applyDiscount`) and says why one does not apply: off, not started, expired, used up, already used by this shopper, under the minimum spend, or nothing in the bag it covers.

## Roles and permissions

`permissions.json` lists the admin modules; each can allow `view`, `edit` and `delete`. A role is a map of module → actions. A person has a role plus their own `overrides`, module by module. The sidebar, every admin route (`PermissionGate`) and every admin service (`assertCan`) check the same map, so a hidden page is refused at its address and by the API as well. The shop always keeps one active owner.

| Role | Can |
|---|---|
| Owner | Everything |
| Manager | Everything except the team; reads settings, money and the log |
| Showroom staff | Orders, stock, returns and messages; reads the rest; no team, settings, money or log |

## Copy with live values

Text in `pages.json` may carry tokens that fill in from Settings when the page renders (`utils/fill.js`): `{freeShipping}`, `{zones}`, `{kampala}`, `{upcountry}`, `{address}`, `{opensAt}`, `{phone}`, `{exchangeDays}`, `{brand}`, `{year}`. A fee change therefore never leaves a stale number in a paragraph.

## No dashes

No em or en dashes anywhere: copy, data, comments or docs (client request). Use a comma, colon or full stop, and "to" for ranges ("XS to XXL"). `npm run lint` runs `scripts/check-dashes.mjs` and fails on any it finds under `src/`.

## What is real and what is a placeholder

Carried over from the old `shop.js` notes. Confirm the placeholders with the shop before launch.

**Real, sourced from the brand:**

- The name QV fits (QVFITS), the handles @quivogue and @quivoguefits.
- The showroom: THE CUBE, G17, Kisementi, Kampala. WhatsApp orders on +256 758 981 959; email qvfits@gmail.com.
- What they make: premium seamless and seam-fit activewear, swim and lounge wear.
- The golf and tennis skort range: sizes XS to XL, with an inbuilt pant.
- Three pieces seen in the brand's own posts: the Seamless Long-Sleeve Set, the Golf and Tennis Skort Dress and the Ribbed Lounge Set.
- The three reviews, quoted word for word as the shop supplied them.
- Hero, campaign, movement, kit and feed photography in `public/photos`: the brand's own.

**Placeholders, to replace:**

- Every price. No prices are published anywhere public.
- Stock counts and size runs (other than XS to XL above). Seed stock is split evenly across colours.
- Delivery fees, the free delivery threshold, the exchange window (7 days) and opening time (10 AM).
- Most product names and descriptions.
- Best sellers: the four with the strongest photos, not real sales data.
- Every offer in `offers.json` (the 20% deal, the 10% sign-up sticker, the "Up to 50% off" slide). Each is a live promise next to the real WhatsApp number: switch it off the day it ends.
- Product photos: Unsplash placeholders until the shop's photography arrives (the admin can upload replacements).
- Exchange rates in `settings.json`, dated in `ratesUpdated`.
