# VPS Deployment Guide (Domain + Port 7117)

This guide deploys:
- **Domain:** `gandharree.vipulphatangare.site`
- **Backend (Node/Express):** `127.0.0.1:7117`
- **Frontend (Vite build):** served by Nginx from `frontend/dist`

---

## 1) DNS

Create an **A record**:
- Host: `gandharree` (or full domain, based on your DNS provider)
- Value: your VPS public IP
- TTL: default

Wait for DNS propagation.

---

## 2) Server prerequisites (Ubuntu)

Install packages:
- `nginx`
- `git`
- `curl`
- `build-essential`
- `certbot`
- `python3-certbot-nginx`
- Node.js 18+ and npm
- `pm2` globally

---

## 3) Project location

Use this folder structure on VPS:

- `/var/www/gandharree/backend`
- `/var/www/gandharree/frontend`

Clone project into `/var/www/gandharree`.

---

## 4) Backend setup

Inside `/var/www/gandharree/backend`:
1. Install deps.
2. Create `.env` from `.env.example`.
3. Set production values:

```env
PORT=7117
NODE_ENV=production
FRONTEND_URL=https://gandharree.vipulphatangare.site
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_STRONG_SECRET
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET
```

> Ensure `.env` is never committed (already handled via `.gitignore`).

---

## 5) Frontend setup

Inside `/var/www/gandharree/frontend`:
1. Install deps.
2. Build production bundle (`dist`).

Your frontend uses `/api` relative calls, so no extra API URL change is needed if Nginx proxy is used.

---

## 6) PM2 process (Backend)

Use PM2 config from:
- `deploy/pm2/ecosystem.config.cjs`

It is preconfigured for:
- app name: `gandharree-backend`
- backend cwd: `/var/www/gandharree/backend`
- port: `7117`

Start app with PM2, save process list, and enable startup on reboot.

---

## 7) Nginx site config

Use:
- `deploy/nginx/gandharree.vipulphatangare.site.conf`

It does:
- serves SPA from `/var/www/gandharree/frontend/dist`
- proxies `/api/*` to `127.0.0.1:7117`
- proxies `/uploads/*` to `127.0.0.1:7117`

Enable site and reload Nginx.

---

## 8) SSL (HTTPS)

Use Certbot with Nginx plugin for:
- `gandharree.vipulphatangare.site`

This will auto-create HTTPS server block and redirect HTTP -> HTTPS.

---

## 9) Firewall

Open only needed ports:
- `22` (SSH)
- `80` (HTTP)
- `443` (HTTPS)

No need to expose 7117 publicly because Nginx proxies locally.

---

## 10) Verify

- `https://gandharree.vipulphatangare.site` should load frontend.
- `https://gandharree.vipulphatangare.site/api/health` should return backend health JSON.
- Uploads should work via `/uploads/...` URLs.

---

## 11) Update deploy flow (next releases)

On each update:
1. Pull latest code.
2. Install backend/frontend deps if needed.
3. Rebuild frontend.
4. Restart PM2 app.
5. Reload Nginx (only if config changed).

---

## Notes

- Keep secrets only in `backend/.env` on VPS.
- If your DB is Mongo Atlas, whitelist VPS IP.
- If Razorpay callbacks are used later, ensure HTTPS is active.
