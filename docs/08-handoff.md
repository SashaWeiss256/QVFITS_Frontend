# Handoff notes for the backend

What the frontend now does that the API has to match or replace. Everything below runs on mock data today, behind the service layer (see 03 and 05).

## Before you start

```bash
npm install          # new packages: gsap, @gsap/react, lenis
npm run dev          # mocks on
npm run dev:dummy    # same, with sample data from dev/dummy (subscribers, campaigns, outbox)
npm run typecheck && npm run lint && npm run build
```

`dev/` is for demos only. It swaps in files from `dev/dummy/` that carry the same path as the file under `src/`. When you change a hook or page that has a twin there, change both, or delete `dev/` and the `dev:dummy` script once the API is live.

## Things to remove before launch

- The mock sign-ins and the `demo123` password (root `README.md`, `dev/dummy/data/staff.json`, `src/data/customers.json`).
- `VITE_API_MOCKS=true` once each route is served by the API.

## Newsletter (admin, Marketing)

The admin has four tabs: Subscribers, Campaigns, Welcome email, Outbox. The services to move onto HTTP:

| Service | Used for |
|---|---|
| `marketing/subscribersApi.ts` | list, unsubscribe, erase (consent given is stored per subscriber) |
| `marketing/campaignsApi.ts` | save draft, schedule, unschedule, send, delete |
| `notifications/outboxApi.ts` | list sent and failed emails, `retryEmail(id)` |
| `content/contentApi.ts` | the welcome email document (on, code, subject, heading, body) |

Sending itself is yours: the frontend only shows status. A campaign needs `draft`, `scheduled`, `sent` states and a preview text.

## Language and currency

- Words: `src/i18n/strings.js` holds English, Swahili, French, Arabic and Chinese. The English sentence is the key. The translations are drafts and need a native review before launch.
- Prices: the shop is priced in UGX. Other currencies are converted in the browser with rates from `open.er-api.com` (`src/utils/liveRates.js`), cached for a day. If you would rather serve rates yourself, return them from the API and change that one file. Orders are always settled in UGX.
- First visit: `WelcomeModal` asks for language and currency once. Choices live in `qvfits:language`, `qvfits:currency` and `qvfits:welcome`. Admin content you enter stays in the language it was written in.

## Browser storage keys

| Key | What |
|---|---|
| `qvfits:consent` | cookie choices `{ version: 1, essential, analytics, marketing, at }`. Analytics and marketing stay off until the shopper agrees. |
| `qvfits:sticker:<tag>` | when the offer card was closed; it stays away for `snoozeDays` |
| `qvfits:admin:nav:folded` | admin sidebar groups a person has folded |

## Behaviour worth knowing

- Smooth scrolling uses Lenis. Any scrolling box inside a drawer or overlay needs `data-lenis-prevent`, or the wheel is blocked.
- Never call `t()` at module level and never name a local variable `t`.
- On phones the buy bar sets `--addbar`; the Vee launcher and the offer card sit above it.
- The hero fills the first screen with the campaign photo. Each slide in `src/data/home.json` has an optional `script` line, set in Pinyon Script (loaded from Google Fonts in `index.html`) with a drawn flourish. The header turns white over the hero until the page scrolls. The hero has no pause control yet.

## Sale

- Sale is an item in the Edits group (`src/data/terms.json`, target label `sale`). Shown in the top bar by default; the owner can move it, hide it or switch it off in the admin under Categories. Its page is `/shop/sale`, and `?sale=1` filters any shop page.
- A piece is on sale when its `salePercent` is set and Sale is live in Offers. Three sample pieces carry one; clear them with the rest of the sample data before launch.
- Returns: online sale orders keep the 7 day right to cancel (the Electronic Transactions Act does not allow it to be waived). Showroom sale purchases are final sale. This is written in `src/pages/9.legal/content/returns.js` and `terms.js`.

## Still open

- Pesapal checkout and payment confirmation (yours).
- Legal pages (terms, privacy, returns) need review by a Ugandan lawyer.
- Live exchange rates have only been tested against sample data, not the real endpoint.
- Kits open in a dialog from the shop; they have no page of their own.
