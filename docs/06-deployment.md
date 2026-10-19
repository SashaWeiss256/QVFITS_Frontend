# 06: Deployment (DigitalOcean)

**Rule:** everything runs in accounts owned by QV fits. We are added as team members; we never own the client's server, database or domain.

## What runs where

| Piece | Where | Notes |
|---|---|---|
| This site (built `dist/`) | DigitalOcean Droplet, served by Nginx | `deploy/nginx/qvfits.conf` |
| `qvfits-api` | Same Droplet, Node.js under PM2, port 5000 | Nginx proxies `/api` to it |
| Database | DigitalOcean Managed MongoDB | Daily automatic backups |
| Redis | Same Droplet (`apt install redis-server`), bound to localhost only | Rate-limit counters shared by every PM2 process; later job queues (email, photos) and the Socket.IO adapter. Set `REDIS_URL`; the API will not start without it |
| Photos | DigitalOcean Spaces + CDN | Uploaded through the API, served as WebP |
| SSL | Let's Encrypt (certbot), auto-renewing | |
| Email | Resend or Brevo | Transactional only |

Two environments: **staging** (`staging.qvfits.com`, live from day 3) and **production** (`qvfits.com`).

## Nginx

`deploy/nginx/qvfits.conf` does three things:

1. Serves `dist/` with an SPA fallback (`try_files $uri /index.html`), long cache headers on hashed assets and no cache on `index.html`.
2. Proxies `/api/` to `http://127.0.0.1:5000`, so the site calls a relative `/api` in every environment.
3. Redirects `www.qvfits.com` to `qvfits.com`.

`public/_redirects` does the same job on Netlify only; Nginx ignores it, so it is harmless in the build.

## Deploys

GitHub Actions on push:

- `main` → build, lint, typecheck → upload `dist/` to production.
- `staging` → the same to staging.

`__APP_BUILD__` is set from the commit SHA (`GIT_SHA`), which clears visitors' persisted query cache on each deploy.

## Domain and DNS (IONOS)

`qvfits.com` is registered at IONOS (expires **29 December 2026**) and has **live IONOS email** on it.

- **Never change the nameservers.** Doing so stops her email.
- In IONOS DNS, change only:
  - the `A` record on `@` → the Droplet's IP (remove the old IONOS placeholder `A`/`AAAA`)
  - `CNAME` `www` → `qvfits.com`
  - `A` record `staging` → the Droplet's IP
- Leave both `MX` records and the `v=spf1` `TXT` record untouched.
- The client makes these changes in her own IONOS login; nobody else takes over the account.

After launch the client changes the Instagram and TikTok bio links to `qvfits.com` and cancels the BrandCrowd plan.

## Monthly cost (approximate, billed to QV fits)

| Service | USD/month |
|---|---:|
| Droplet 2 GB / 1 vCPU | 12 |
| Managed MongoDB | 15 |
| Spaces + CDN | 5 |
| Droplet backups | 2.40 |
| Email (free tier) | 0 |

Confirm against DigitalOcean's current pricing when the account is created.

## Launch checklist

- [ ] Final prices, delivery fees, exchange window and showroom hours loaded
- [ ] Payment gateway approved; a live test payment made and refunded
- [ ] Order emails received by a customer address and the shop address
- [ ] DNS records in, SSL issued for `qvfits.com` and `www`
- [ ] IONOS email still receiving after the DNS change
- [ ] Owner trained; admin and DigitalOcean logins handed over
