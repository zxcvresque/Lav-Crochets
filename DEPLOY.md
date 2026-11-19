# Deploying Lav Crochets

This guide covers deploying the Lav Crochets Next.js 15 app to production.

---

## Prerequisites

- Docker and Docker Compose installed on the target server.
- A domain name pointed to your server (or Cloudflare account with a tunnel).
- Accounts for Resend (email) and Razorpay (payments).
- (Optional) Google OAuth credentials for sign-in.

---

## 1. Docker Compose Setup

### Build and Start

```bash
# Copy the production env template
cp .env.production .env

# Edit .env and fill in all values (see Section 6 below)

# Pull the latest image and start
docker compose up -d --build

# Verify the container is running
docker compose ps
```

### Initialise the Database

```bash
# Run Prisma migrations (creates tables if new, does nothing if up to date)
docker compose exec app npx prisma migrate deploy

# Seed sample data (optional — remove seed.ts lines if not needed)
docker compose exec app npx tsx prisma/seed.ts
```

### Logs and Restart

```bash
# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down
```

### Updating

```bash
git pull
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

---

## 2. Manual VPS Setup (without Docker)

Tested on Ubuntu 22.04 with Node.js 20.

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone / copy the project
git clone https://github.com/your-org/lav-crochets.git
cd lav-crochets
npm install
npx prisma generate
npx prisma migrate deploy

# Copy and fill env vars
cp .env.production .env
nano .env

# Build
npm run build

# Start with PM2
pm2 start npm --name "lav-crochets" -- start

# Keep running after reboot
pm2 startup
pm2 save
```

---

## 3. Railway / Render / Fly.io Notes

### Railway

1. Create a new Railway project, link the GitHub repo.
2. Add a **Persistent Disk** (volume mount at `/app/data` for the SQLite DB).
3. Set all environment variables in the Railway dashboard (from `.env.production`).
4. Set the **Build Command**: `npx prisma generate && npm run build`
5. Set the **Start Command**: `node .next/standalone/server.js`
6. Deploy. Add a custom domain in Railway settings.

### Render

1. Create a **Web Service**, link the repo.
2. Set **Build Command**: `npx prisma generate && npm run build`
3. Set **Start Command**: `node .next/standalone/server.js`
4. Add a **Persistent Disk** mount at `/app/data`.
5. Add all environment variables.
6. Add custom domain in service settings.

### Fly.io

1. `fly launch` — accept defaults.
2. Create a volume: `fly volumes create lav_data --region iad --size 1`
3. Edit `fly.toml` to mount the volume:

   ```toml
   [mounts]
     source = "lav_data"
     destination = "/app/data"
   ```
4. Set env vars: `fly secrets set BETTER_AUTH_SECRET="..." RESEND_API_KEY="..." ...`
5. `fly deploy`

---

## 4. Cloudflare Tunnel Setup

Cloudflare Tunnel (zero-trust) lets you expose the container without opening firewall ports. Use it for both temporary testing URLs and permanent production domains.

### Install cloudflared

```bash
# On the server
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

### Option A: Temporary URL for Testing

```bash
cloudflared tunnel --url http://localhost:3000
```

Copy the `trycloudflare.com` URL shown. Use it as `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` in `.env`, then rebuild the container.

### Option B: Permanent Tunnel for Production

#### Step 1 — Create a named tunnel

```bash
cloudflared tunnel create lav-crochets
```

Save the tunnel UUID from the output.

#### Step 2 — Create a config file

```bash
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: /etc/cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: lav-crochets.art        # <-- your domain
    service: http://localhost:3000
  - service: http_status:404
```

#### Step 3 — Route the tunnel to your domain

```bash
# Point DNS at Cloudflare
cloudflared tunnel route dns <TUNNEL_NAME> lav-crochets.art

# Or route to the full hostname
cloudflared tunnel route dns <TUNNEL_UUID> lav-crochets.art
```

Ensure `lav-crochets.art` is added as a DNS record in your Cloudflare dashboard, pointing to the tunnel.

#### Step 4 — Run as a systemd service

```bash
sudo nano /etc/systemd/system/cloudflared.service
```

```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared --config /etc/cloudflared/config.yml
Restart=on-failure
RestartSec=5s
User=root

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared
```

#### Step 5 — Set environment variables

After the tunnel is live and DNS propagates, set in `.env`:

```
BETTER_AUTH_URL=https://lav-crochets.art
NEXT_PUBLIC_SITE_URL=https://lav-crochets.art
```

Rebuild/restart the container for changes to take effect.

---

## 5. Post-Deployment Checklist

### Environment Variables

- [ ] `BETTER_AUTH_SECRET` — run `openssl rand -base64 32` to generate.
- [ ] `BETTER_AUTH_URL` — set to the public URL (e.g. `https://lav-crochets.art`).
- [ ] `NEXT_PUBLIC_SITE_URL` — same as `BETTER_AUTH_URL`.
- [ ] All other vars filled from Resend, Razorpay, and Google OAuth dashboards.

### Google OAuth Redirect URIs

In the Google Cloud Console for your OAuth 2.0 Client:

1. Go to **Credentials** > click your Web client.
2. Under **Authorised redirect URIs**, add:
   ```
   {NEXT_PUBLIC_SITE_URL}/api/auth/callback/google
   ```
3. Save.

### Resend Domain Verification

1. In Resend dashboard, go to **Domains** > **Add Domain**.
2. Enter your domain (e.g. `lav-crochets.art`).
3. Add the DNS TXT and MX records shown to your DNS provider.
4. Wait for verification (can take up to 24 hours, usually minutes).
5. Once verified, you can send from any address at that domain.
6. Update `RESEND_FROM_EMAIL` to your verified address:
   ```
   RESEND_FROM_EMAIL="Lav Crochets <hello@lav-crochets.art>"
   ```
7. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your permanent domain before sending magic links in production.

### Razorpay Production Switchover

1. Log in to your Razorpay Dashboard.
2. Go to **Settings > API Keys**.
3. Click **Generate Live API Key**. Copy the Key ID and Key Secret.
4. In your `.env` / deployment environment:
   - Set `RAZORPAY_KEY_ID` to the live key (starts with `rzp_live_`).
   - Set `RAZORPAY_KEY_SECRET` to the live secret.
   - Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` to the live public key (starts with `rzp_live_`).
5. Ensure `RAZORPAY_KEY_ID` matches `NEXT_PUBLIC_RAZORPAY_KEY_ID` in value — both should be the live Key Id.
6. In your Razorpay Dashboard, verify your **Account Details** (GSTIN, bank account) are complete to accept real payments.
7. Test with a small live payment before going fully live.

### Final Checks

- [ ] Site loads at the public URL without errors.
- [ ] Admin can log in.
- [ ] Order placement flow works end-to-end.
- [ ] Email (magic link / order confirmation) sends successfully.
- [ ] No console errors in browser DevTools.

---

## Quick Reference

| Task | Command |
|------|---------|
| Start | `docker compose up -d --build` |
| Stop | `docker compose down` |
| View logs | `docker compose logs -f` |
| DB migrate | `docker compose exec app npx prisma migrate deploy` |
| DB seed | `docker compose exec app npx tsx prisma/seed.ts` |
| Restart | `docker compose restart` |
| Update | `git pull && docker compose up -d --build` |
