# 04 — Design System (Quivogue)

**Rule:** the rebuild looks like Quivogue. Every colour, font, radius and shadow comes from `Quivogue/quivogue/css/style.css`, and every storefront section is a port of a Quivogue section. When in doubt, open the Quivogue page beside ours and match it.

## How it is wired

- `src/styles/quivogue.css` is Quivogue's `css/style.css`, **whole and unchanged**. Its later blocks deliberately override earlier ones, so it is kept as one file in its original order.
- `src/index.css` imports Tailwind, then loads that file into Tailwind's `components` layer, so a utility class can still override it.
- `@theme inline` in `index.css` maps every Quivogue variable to a Tailwind token of the same name: `bg-brand-500`, `text-ink-3`, `rounded-r-lg`, `shadow-sh-2`, `font-display`. The values live in one place, the `:root` block of `quivogue.css`.
- QV FITS additions sit at the end of `index.css`: `.input`, `.btn--danger`, the logo sizing, the header breakpoint (below), the five-column footer (brand, Shop, Help, Legal, Visit) and **no rule before `.kicker` labels** (client request: the eyebrow labels have no leading dash anywhere).
- Ported markup keeps Quivogue's class names (`.card`, `.hdr`, `.drawer`, `.mini-row`, `.asst` …). New UI (forms, the dashboards) uses utilities on the tokens.

## Tokens

| Group | Tokens | Use |
|---|---|---|
| Brand | `brand-50` … `brand-600`, `brand-grad` | Magenta to purple, sampled from the QV FITS logo. `brand-grad` for primary buttons and accents |
| Secondary | `teal-100`, `teal-500` | The golf and tennis range |
| Warm neutrals | `sand-50` … `sand-400`, `cream`, `cream-2`, `beige`, `white` | Surfaces; from the lounge and seamless photography |
| Ink | `ink`, `ink-2`, `ink-3`, `ink-4` | Text. Contrast-checked on `cream`: 15.6, 9.3, 6.1 and 4.6 to 1. **`ink-4` is the lightest text allowed.** Do not lighten these |
| Lines | `line`, `line-2` | Borders and rules |
| Accents | `gold` (never text, 1.5:1), `star` (readable gold), `success`, `warn` | Badges, ratings, states |
| Type | `display` (Archivo), `body` (Inter), `script` (Archivo) | Anton for the big campaign headlines |
| Shape | `r-sm` 8, `r-md` 12, `r-lg` 16, `r-xl` 22, `r-pill` | Squarer than a boutique look |
| Elevation | `sh-1` … `sh-4` | Neutral shadows, never pink |
| Layout | `wrap` 1240px, `gut` clamp(18px, 4vw, 44px), `card-min` 236px | Page width, side gutter, product card minimum |

Fonts load in `index.html` with Quivogue's Google Fonts URL (Anton; Archivo 500–800; Inter 400–600).

## Logo

The supplied lockups are in `public/logo/`. The header and footer use `qvfits-logo-horizontal.svg` (about 3.6 : 1) at 44px and 48px tall, 36px below 1280px. The admin sidebar uses the same lockup; the loader and the admin sign-in use `qvfits-icon.svg`. Quivogue's old `brand/logo.png` is not used.

## Component classes

The shared classes come straight from `quivogue.css`: `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--soft`, `.wrap`, `.section`, `.section--tight`, `.section-head`, `.kicker`, `.lede`, `.eyebrow`, `.center`, `.link-arrow`. `components/ui/Button` maps its `variant` onto them.

## Chrome

The shared chrome is a port of `js/app.js` `buildChrome()` and friends:

| Quivogue | Ours |
|---|---|
| `PROMO_BAR` strip | `components/layout/PromoBar.jsx` |
| Header, nav, `wireSearch()` | `components/layout/navbar/` (`index`, `NavLinks`, `SearchPanel`, `Logo`) |
| `currencyPicker()` | `components/storefront/CurrencyPicker.jsx` |
| `renderDrawer()` (bag, saved, menu) | `components/layout/SideDrawer.jsx` + `storefront/CartPanel`, `storefront/WishlistPanel`, `navbar/MenuPanel` |
| `productCard()` | `components/storefront/ProductCard.jsx` |
| `media()` | `components/storefront/Photo.jsx` + `utils/media.js` (WebP ladder, JPEG fallback, "photo coming") |
| `initReveal()`, `initAccordions()` | `components/ui/Reveal.jsx`, `Accordion.jsx` |
| `toast()` | `components/ui/NetworkStatus.jsx`, fed by `notify()` from `store/tanstackStore/notices` |
| `js/assistant.js` widget | `components/assistant/FitAssistant.jsx`; the intent parser is still to port into `fitAssistantApi.ts` |
| `STICKER` | to port (`components/storefront/Sticker.jsx`) |
| Footer | `components/layout/footer/Footer.jsx` |

**Differences from Quivogue, on purpose:** the header has an account icon (signed-in shoppers), so the inline search collapses behind its icon below 1500px instead of 1100px (a small laptop squeezed it to 51px), and below 1280px the account link moves into the side menu. The footer adds Track an order, Your account, Exchanges & returns, Privacy and Terms.

## Responsive ranges

Audited at 19 sizes, every storefront, account and admin page: no sideways scroll, no header wrap, every control at least 44px to tap on touch screens.

| Range | Widths checked | What changes |
|---|---|---|
| Small phones | 320, 360 | Lockup 28px tall at 380px and below |
| Phones | 375 to 430 | Quivogue's phone refinements; search behind its icon |
| Tablets | 600, 768, 820, 1024, 1180 | Quivogue's tightened nav (701 to 1080); account link in the side menu |
| Laptops | 1280, 1366, 1440, 1536, 1680 | Full nav; inline search from 1500px |
| Desktops | 1920 | Quivogue's 1620px column |
| Large screens and TV | 2560, 3840 | Whole page zoomed 1.25× from 2400px and 2× from 3200px, so a 4K TV lays out like a 1920px desktop at twice the size |

## Product photos

Product cards use free Unsplash photos as placeholders (`src/data/productImages.js`, two per product, cropped to 3:4 on request). The hero, campaign and movement photos stay local in `public/photos`: they are the brand's own. `Photo` serves either kind (`utils/media.js`).

## Page sections

| Quivogue page | Ours | Sections |
|---|---|---|
| `index.html` | `pages/1.home/` | `Hero` + `heroSlideshow/` (done), `NewArrivals`, `BestSellers`, `Movements`, `Campaign`, `Promo`, `Press`, `ShopTheFeed`, `Newsletter` |
| `shop.html` | `pages/2.shop/shop.jsx` | `shopFilters/` (category, size, colour, occasion, price, in stock), `Deals`, `Kits`, empty state |
| `product.html` | `pages/2.shop/product.jsx` | `productGallery/`, `productBuyPanel/` (colour, size, stock note, add), `Related` |
| `about.html` | `pages/3.about/` | as on the page |
| `size-guide.html` | `pages/4.size-guide/` | size chart, how to measure, FAQ |
| `contact.html` | `pages/5.contact/` | details, map, form |
| `cart.html` | `pages/6.cart/` | `CheckoutSteps`, `checkoutForm/`, `SendOrder` (WhatsApp, kept beside online payment) |
| `404.html` | `components/layout/NotFound.jsx` | |
| `admin.html` | `AdminDashboard/` | its three tabs grow into the admin modules |

## Porting a section

1. Open the Quivogue page and find the section's markup and its CSS in `style.css`.
2. Create `sections/<SectionName>.jsx`. Copy the structure and translate the CSS to utilities on our tokens; reuse `.btn`, `.kicker`, etc.
3. Replace the data it read from `js/data.js` with a query hook (`useProducts`, `useHeroSlides` …). Never import `src/data/`.
4. Check it side by side at 375px and 1280px. Check the floors below.

## Floors (from the Quivogue audit, do not regress)

- Every control has a 44×44px touch area.
- Text uses `ink` to `ink-4` only; white over photos sits on a scrim that passes 4.5:1.
- Exactly one `h1` per page, with no skipped heading levels.
- Every image has its real width and height and a 400/800 WebP ladder.
- The home page stays near Quivogue's ~205 KB first load.
- `prefers-reduced-motion` turns off the slideshow and reveal motion.

## Dashboards

The customer area uses the storefront look. The admin uses the same tokens and fonts in a calmer layout (sidebar, tables, panels on `cream`/`white`), so it is visibly the same brand. No colours, fonts or component styles are taken from Artistry or Belioras.
