# QV FITS

The online shop for **QV FITS** (Quivogue): premium seamless and seam-fit activewear, swim and lounge wear, from the showroom at THE CUBE, G17 Kisementi, Kampala. A MERN rebuild of the static site in `Quivogue/quivogue`, keeping its look.

- **Storefront** at `/`: shop, product pages, bag, guest checkout, size guide, Vee the fit assistant
- **Customer account** at `/account`: sign up at `/signup`, orders, saved pieces, addresses
- **Admin** at `/admin`: catalog, orders, customers, discounts, offers, website content, team, settings

The API is a separate repo, `qvfits-api` (Express + MongoDB). Until it is live, every screen runs on mock data behind the service layer.

## Stack

Vite 8 · React 19 · React Router 7 · Tailwind CSS 4 · TanStack Query · react-hook-form + zod · Lucide · Motion · Recharts. Hosted on DigitalOcean behind Nginx.

## Run

```bash
npm install
cp .env.example .env.local   # mocks on by default
npm run dev                  # http://localhost:5173
npm run typecheck && npm run lint && npm run build
```

Mock sign-ins (development only, removed when the API lands):

| Area | Email | Password |
|---|---|---|
| Customer | `shopper@qvfits.com` | `demo123` |
| Admin (owner) | `owner@qvfits.com` | `demo123` |
| Admin (staff) | `staff@qvfits.com` | `demo123` |

## Docs

Start at [`docs/README.md`](docs/README.md): the golden rules, the build status, and links to the conventions, folder structure, data layer, design system, backend contract and deployment.
