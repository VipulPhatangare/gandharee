# VPS Deployment Guide (Domain: `gandharree.vipulphatangare.site`, Backend Port: `7117`)

This project is already configured for:
- **Domain:** `gandharree.vipulphatangare.site`
- **Backend:** Node/Express on `127.0.0.1:7117`
- **Frontend:** static build served by Nginx from `/var/www/gandharree/frontend/dist`

Use the steps below on an Ubuntu VPS.

---

## 1) Point domain to VPS

Create DNS **A** record:
- Host: `gandharree` (or full hostname per your DNS panel)
- Value: `<YOUR_VPS_PUBLIC_IP>`

Wait until DNS resolves to your server IP.

---

## 2) Install base dependencies

```bash
sudo apt update
sudo apt install -y nginx git curl build-essential certbot python3-certbot-nginx ufw
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

---

## 3) Place project in `/var/www/gandharree`

```bash
sudo mkdir -p /var/www/gandharree
sudo chown -R $USER:$USER /var/www/gandharree
cd /var/www/gandharree
git clone <YOUR_REPO_URL> .
```

Expected structure:
- `/var/www/gandharree/backend`
- `/var/www/gandharree/frontend`

---

## 4) Configure backend `.env`

```bash
cd /var/www/gandharree/backend
cp .env.example .env
```

Edit `/var/www/gandharree/backend/.env` and ensure these values:

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

Then install backend dependencies:

```bash
cd /var/www/gandharree/backend
npm install
```

---

## 5) Build frontend

```bash
cd /var/www/gandharree/frontend
npm install
npm run build
```

Your frontend API calls already use relative `/api`, so Nginx proxy handles routing automatically.

---

## 6) Start backend with PM2 (port `7117`)

PM2 config is already prepared in:
- `deploy/pm2/ecosystem.config.cjs`

Run:

```bash
cd /var/www/gandharree
pm2 start deploy/pm2/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER
```

Then execute the extra `sudo` command shown by the previous output (PM2 prints it).

Check status:

```bash
pm2 status
pm2 logs gandharree-backend --lines 100
```

---

## 7) Configure Nginx for your domain

Nginx config file already exists in repo:
- `deploy/nginx/gandharree.vipulphatangare.site.conf`

Install it:

```bash
sudo cp /var/www/gandharree/deploy/nginx/gandharree.vipulphatangare.site.conf /etc/nginx/sites-available/gandharree.vipulphatangare.site.conf
sudo ln -sf /etc/nginx/sites-available/gandharree.vipulphatangare.site.conf /etc/nginx/sites-enabled/gandharree.vipulphatangare.site.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8) Enable HTTPS (Certbot)

```bash
sudo certbot --nginx -d gandharree.vipulphatangare.site
```

Select redirect option when asked so HTTP automatically forwards to HTTPS.

---

## 9) Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

Only ports `22`, `80`, `443` need to be public. Port `7117` remains internal.

---

## 10) Verify deployment

```bash
curl -I https://gandharree.vipulphatangare.site
curl https://gandharree.vipulphatangare.site/api/health
```

Expected:
- frontend loads at `https://gandharree.vipulphatangare.site`
- health JSON from `/api/health`
- uploaded files available through `/uploads/...`

---

## 11) Future update flow

```bash
cd /var/www/gandharree
git pull
cd backend
npm install
cd ../frontend
npm install
npm run build
cd ..
pm2 restart gandharree-backend
sudo systemctl reload nginx
```

---

## Troubleshooting quick checks

- PM2 app not up: `pm2 logs gandharree-backend --lines 200`
- Nginx bad config: `sudo nginx -t`
- Backend not reachable via proxy: confirm app listens on `127.0.0.1:7117` and `.env` has `PORT=7117`
- Mongo connection error: verify `MONGO_URI` and network/IP allowlist (if using Atlas)
