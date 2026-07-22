# YOYO Hotel Booking — Production Deployment Guide

> **Domain:** mayankcodes.dev  
> **Frontend:** yoyo.mayankcodes.dev (Vercel)  
> **Backend API:** api.yoyo.mayankcodes.dev (AWS EC2 t2.micro, Ubuntu 22.04)  
> **CI/CD:** jenkins.mayankcodes.dev (same EC2 instance)  
> **Last updated:** July 2026

---

## Table of Contents

1. [AWS EC2 Setup (Free Tier)](#section-1-aws-ec2-setup-free-tier)
2. [NGINX Configuration](#section-2-nginx-configuration)
3. [Jenkins on the Same EC2 Instance](#section-3-jenkins-on-the-same-ec2-instance)
4. [Vercel Frontend Deployment](#section-4-vercel-frontend-deployment)
5. [Cloudflare DNS Setup](#section-5-cloudflare-dns-setup)
6. [Post-Deploy Checklist](#section-6-post-deploy-checklist)
7. [Environment Variables Reference](#section-7-environment-variables-reference)

---

## Section 1: AWS EC2 Setup (Free Tier)

### 1.1 Launch a t2.micro Ubuntu 22.04 Instance

1. Log in to the **AWS Management Console** → navigate to **EC2 → Instances → Launch Instances**.
2. Fill in the following:
   - **Name:** `yoyo-production`
   - **AMI:** Ubuntu Server 22.04 LTS (HVM), SSD Volume Type — `ami-0f5ee92e2d63afc18` *(ap-south-1)*
   - **Instance type:** `t2.micro` (Free Tier eligible — 1 vCPU, 1 GiB RAM)
   - **Key pair:** Create a new key pair named `yoyo-ec2-key`, type RSA, format `.pem`. Download and store it safely.
   - **Storage:** 30 GiB gp2 (the maximum for Free Tier).
3. Click **Launch Instance**.

### 1.2 Configure the Security Group

While launching (or after, by editing the Security Group), open these **inbound** rules:

| Type        | Protocol | Port Range | Source        | Purpose                        |
|-------------|----------|------------|---------------|--------------------------------|
| SSH         | TCP      | 22         | My IP         | SSH access                     |
| HTTP        | TCP      | 80         | 0.0.0.0/0    | HTTP → HTTPS redirect (NGINX)  |
| HTTPS       | TCP      | 443        | 0.0.0.0/0    | HTTPS traffic                  |
| Custom TCP  | TCP      | 8080       | 0.0.0.0/0    | Jenkins web UI                 |
| Custom TCP  | TCP      | 4000       | 127.0.0.1/32 | Node.js (internal only)        |

> **Note:** Port 4000 (Node.js) should NOT be opened to the world — NGINX proxies it internally.

All **outbound** traffic: Allow All (default).

### 1.3 Allocate and Associate an Elastic IP

A free-tier EC2 instance is assigned a **new public IP every time it restarts**. Fix this with an Elastic IP.

1. **EC2 → Elastic IPs → Allocate Elastic IP address.**
2. Choose **Amazon's pool of IPv4 addresses** → click **Allocate**.
3. Select the newly allocated IP → **Actions → Associate Elastic IP address**.
4. Select your `yoyo-production` instance → click **Associate**.
5. Note the IP — for this guide we assume it is **`3.110.45.200`**.

> **Cost note:** Elastic IPs are free as long as they are associated with a running instance. You are charged if the IP is allocated but unassociated, or if the instance is stopped.

### 1.4 SSH Into the Instance

```bash
# From your local machine (Windows: use Git Bash, WSL, or PowerShell)
chmod 400 ~/Downloads/yoyo-ec2-key.pem

ssh -i ~/Downloads/yoyo-ec2-key.pem ubuntu@3.110.45.200
```

On first login you will see the Ubuntu welcome banner. All subsequent commands in this section run **on the EC2 instance** unless otherwise noted.

### 1.5 Update the System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential unzip
```

### 1.6 Install Node.js 20 via nvm

Using **nvm** (Node Version Manager) is strongly recommended over the Ubuntu APT Node.js package because it lets you switch versions without sudo.

```bash
# Download and run the nvm install script
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell profile so 'nvm' is available in this session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 20 (LTS)
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version   # should print v20.x.x
npm --version    # should print 10.x.x
```

Add nvm initialization to `.bashrc` so it persists across SSH sessions:

```bash
cat >> ~/.bashrc << 'EOF'

# nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF

source ~/.bashrc
```

### 1.7 Install PM2

PM2 is the Node.js process manager that keeps your server running after crashes and reboots.

```bash
npm install -g pm2

# Verify
pm2 --version   # should print 5.x.x
```

### 1.8 Install NGINX

```bash
sudo apt install -y nginx

# Start and enable NGINX so it starts on boot
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
# Should show: active (running)

# Quick smoke-test
curl http://localhost
# Should return the NGINX default page HTML
```

### 1.9 Clone the Repository

```bash
# Move to the ubuntu home directory
cd /home/ubuntu

# Clone via HTTPS (use a GitHub Personal Access Token if the repo is private)
git clone https://github.com/mayankcodes/yoyo.git

# If the repo is private:
# git clone https://<your_github_username>:<github_pat>@github.com/mayankcodes/yoyo.git

cd yoyo
```

### 1.10 Install Server Production Dependencies

```bash
cd /home/ubuntu/yoyo/server
npm ci --omit=dev

# Verify no errors
echo "Exit code: $?"
```

### 1.11 Create the .env File

```bash
cd /home/ubuntu/yoyo/server

# Copy the template
cp ../.env.example .env

# Open in nano (or vim)
nano .env
```

Fill in **every** variable. Pay special attention to:

- `MONGODB_URI` — get this from MongoDB Atlas → Connect → Drivers
- `JWT_SECRET` — generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `JWT_REFRESH_SECRET` — generate the same way (different value)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from Razorpay Dashboard
- `SMTP_USER` / `SMTP_PASS` — Gmail App Password

Save and exit: `Ctrl+O`, `Enter`, `Ctrl+X`.

Lock down the file permissions:

```bash
chmod 600 /home/ubuntu/yoyo/server/.env
```

### 1.12 Start the Application with PM2

```bash
cd /home/ubuntu/yoyo/server

# Start the server under PM2
pm2 start server.js --name yoyo-server

# Watch live logs
pm2 logs yoyo-server --lines 30

# Check the process is listed and "online"
pm2 list
```

Expected output:
```
┌─────┬───────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id  │ name          │ namespace   │ version │ mode    │ pid      │ uptime │  ↺   │ status    │
├─────┼───────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0   │ yoyo-server   │ default     │ 1.0.0   │ fork    │ 12345    │ 5s     │ 0    │ online    │
└─────┴───────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

### 1.13 Configure PM2 Startup (Survive Reboots)

```bash
# Generate the systemd startup script
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# PM2 will print a command starting with "sudo env PATH=...". Copy it exactly and run it.
# Example (yours will be slightly different — copy the ACTUAL output):
sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.15.0/bin \
    /home/ubuntu/.nvm/versions/node/v20.15.0/lib/node_modules/pm2/bin/pm2 \
    startup systemd -u ubuntu --hp /home/ubuntu

# Save the current PM2 process list so it is restored on reboot
pm2 save

# Verify systemd knows about it
sudo systemctl status pm2-ubuntu
```

Test the startup by rebooting (optional but recommended):

```bash
sudo reboot
# Wait ~30 seconds, then SSH back in
ssh -i ~/Downloads/yoyo-ec2-key.pem ubuntu@3.110.45.200
pm2 list   # yoyo-server should be "online"
```

---

## Section 2: NGINX Configuration

### 2.1 Remove the Default NGINX Site

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

### 2.2 Create the API Virtual Host

```bash
sudo nano /etc/nginx/sites-available/api.yoyo.mayankcodes.dev
```

Paste the full configuration (see `docs/nginx-api.conf` in this repository for the complete file, or paste the contents directly):

```nginx
# Rate limiting zone — defined in the http context
# (If you have multiple server blocks, define this in /etc/nginx/nginx.conf http{} block instead)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;

server {
    listen 80;
    listen [::]:80;
    server_name api.yoyo.mayankcodes.dev;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name api.yoyo.mayankcodes.dev;

    # SSL — Certbot will insert the correct paths when you run it
    ssl_certificate     /etc/letsencrypt/live/api.yoyo.mayankcodes.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yoyo.mayankcodes.dev/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Proxy to Node.js
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        limit_req zone=api_limit burst=50 nodelay;
    }

    # WebSocket upgrade for Socket.io
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host       $host;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/api.yoyo.mayankcodes.dev \
           /etc/nginx/sites-enabled/api.yoyo.mayankcodes.dev

sudo nginx -t   # must print: configuration file ... syntax is ok
sudo systemctl reload nginx
```

### 2.3 Install Certbot and Obtain SSL Certificate

```bash
# Install Certbot with the NGINX plugin
sudo apt install -y certbot python3-certbot-nginx

# Obtain and auto-install the certificate for the API domain
sudo certbot --nginx -d api.yoyo.mayankcodes.dev

# Follow the interactive prompts:
#   1. Enter your email address
#   2. Agree to the Terms of Service (A)
#   3. Choose whether to share your email with EFF (Y/N)
# Certbot will automatically modify the NGINX config to add SSL directives.
```

Verify the certificate was obtained:

```bash
sudo certbot certificates
# Should list api.yoyo.mayankcodes.dev with expiry ~90 days from now
```

Test auto-renewal:

```bash
sudo certbot renew --dry-run
# Should end with: "Congratulations, all simulated renewals succeeded"
```

Certbot automatically creates a systemd timer for renewal. Verify it:

```bash
sudo systemctl status certbot.timer
```

### 2.4 Test the NGINX Configuration

```bash
sudo nginx -t && sudo systemctl reload nginx

# Quick API test from the server itself
curl -s http://localhost:4000/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test through NGINX + HTTPS
curl -s https://api.yoyo.mayankcodes.dev/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

---

## Section 3: Jenkins on the Same EC2 Instance

### 3.1 Install Java 17

Jenkins requires Java. Install the OpenJDK 17 JRE:

```bash
sudo apt update
sudo apt install -y openjdk-17-jre

# Verify
java -version
# Should print: openjdk version "17.x.x" ...
```

### 3.2 Install Jenkins

```bash
# Add Jenkins repository and GPG key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
    | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
    https://pkg.jenkins.io/debian-stable binary/" \
    | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install
sudo apt update
sudo apt install -y jenkins

# Start and enable Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check status
sudo systemctl status jenkins
# Should show: active (running)
```

### 3.3 Open the Firewall for Jenkins (port 8080)

Port 8080 should already be open in the AWS Security Group (Step 1.2). Also allow it in UFW if it is active:

```bash
sudo ufw status
# If active:
sudo ufw allow 8080/tcp
sudo ufw reload
```

### 3.4 Retrieve the Initial Admin Password

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
# Copy this password — you need it in the next step
```

### 3.5 Complete the Jenkins Initial Setup Wizard

1. Open a browser: `http://3.110.45.200:8080`
2. Paste the initial admin password.
3. Choose **Install suggested plugins** (this installs Pipeline, Git, Credentials, etc.).
4. Create the first admin user:
   - Username: `admin`
   - Password: *(choose a strong password)*
   - Full name: `YOYO Admin`
   - Email: `mayank@mayankcodes.dev`
5. Instance Configuration URL: `http://jenkins.mayankcodes.dev` (or leave the default for now).
6. Click **Save and Finish → Start using Jenkins**.

### 3.6 Install Additional Jenkins Plugins

Go to **Manage Jenkins → Plugins → Available plugins** and install:

| Plugin Name                     | Purpose                                      |
|---------------------------------|----------------------------------------------|
| Pipeline                        | Declarative/Scripted pipelines               |
| Git                             | Clone from GitHub                            |
| GitHub Integration              | Webhook trigger support                      |
| SSH Agent                       | Forward SSH keys to pipeline steps           |
| NodeJS                          | Manage Node.js versions from Jenkins         |
| Credentials Binding             | Inject secrets as environment variables      |
| Email Extension                 | Rich HTML build failure notifications        |
| HTML Publisher                  | Display Jest coverage reports in Jenkins     |
| JUnit                           | Display Jest test results as a trend graph   |
| Blue Ocean (optional)           | Modern pipeline visualization UI             |

After installing, click **Restart Jenkins when installation is complete and no jobs are running**.

### 3.7 Configure the NodeJS Tool

1. **Manage Jenkins → Tools → NodeJS installations → Add NodeJS**
2. Set:
   - **Name:** `NodeJS-20`  *(must match `tools { nodejs "NodeJS-20" }` in Jenkinsfile)*
   - **Version:** `NodeJS 20.15.0`
   - **Global npm packages to install:** `vercel`
3. Click **Save**.

### 3.8 Add Credentials in Jenkins

Go to **Manage Jenkins → Credentials → System → Global credentials → Add Credential**.

Add the following credentials one by one:

#### EC2_HOST (Secret Text)
- Kind: Secret text
- ID: `EC2_HOST`
- Secret: `3.110.45.200`
- Description: EC2 Elastic IP

#### EC2_USER (Secret Text)
- Kind: Secret text
- ID: `EC2_USER`
- Secret: `ubuntu`
- Description: EC2 SSH username

#### EC2_SSH_KEY (SSH Username with private key)
- Kind: SSH Username with private key
- ID: `EC2_SSH_KEY`
- Username: `ubuntu`
- Private Key: **Enter directly** → paste the contents of `yoyo-ec2-key.pem`
- Description: EC2 SSH private key

#### VERCEL_TOKEN (Secret Text)
- Kind: Secret text
- ID: `VERCEL_TOKEN`
- Secret: *(your Vercel personal access token — see Section 4)*
- Description: Vercel deploy token

#### VERCEL_ORG_ID (Secret Text)
- Kind: Secret text
- ID: `VERCEL_ORG_ID`
- Secret: `team_XXXXXXXXXXXXXXXXXXXXXXXX`
- Description: Vercel organization/team ID

#### VERCEL_PROJECT_ID (Secret Text)
- Kind: Secret text
- ID: `VERCEL_PROJECT_ID`
- Secret: `prj_XXXXXXXXXXXXXXXXXXXXXXXX`
- Description: Vercel project ID

> **How to find Vercel ORG_ID and PROJECT_ID:**  
> Run `vercel link` in your `client/` directory locally.  
> The values will be written to `client/.vercel/project.json`.

### 3.9 Create the Jenkins Pipeline Job

1. **New Item → Enter name: `YOYO-Production` → Pipeline → OK**
2. Under **General:**
   - ☑ GitHub project — URL: `https://github.com/mayankcodes/yoyo/`
3. Under **Build Triggers:**
   - ☑ GitHub hook trigger for GITScm polling
4. Under **Pipeline:**
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/mayankcodes/yoyo.git`
   - Credentials: *(add GitHub credentials if the repo is private)*
   - Branch Specifier: `*/main`
   - Script Path: `Jenkinsfile`
5. Click **Save**.

### 3.10 NGINX Virtual Host for jenkins.mayankcodes.dev

```bash
sudo nano /etc/nginx/sites-available/jenkins.mayankcodes.dev
```

Paste:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name jenkins.mayankcodes.dev;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name jenkins.mayankcodes.dev;

    ssl_certificate     /etc/letsencrypt/live/jenkins.mayankcodes.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jenkins.mayankcodes.dev/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Jenkins requires these headers
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_read_timeout 90s;

        # Required for Jenkins redirects to work correctly
        proxy_redirect http://127.0.0.1:8080 https://jenkins.mayankcodes.dev;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/jenkins.mayankcodes.dev \
           /etc/nginx/sites-enabled/jenkins.mayankcodes.dev

sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate for Jenkins
sudo certbot --nginx -d jenkins.mayankcodes.dev

sudo nginx -t && sudo systemctl reload nginx
```

Update the Jenkins URL to match:

1. **Manage Jenkins → System → Jenkins URL**
2. Set to: `https://jenkins.mayankcodes.dev/`
3. Click **Save**.

### 3.11 Set Up the GitHub Webhook

In your **GitHub repository** (https://github.com/mayankcodes/yoyo):

1. Go to **Settings → Webhooks → Add webhook**.
2. Fill in:
   - **Payload URL:** `https://jenkins.mayankcodes.dev/github-webhook/`
   - **Content type:** `application/json`
   - **Secret:** *(leave blank or set a secret and add it as a Jenkins credential)*
   - **Which events:** Just the **push** event (or "Send me everything")
3. Click **Add webhook**.

GitHub will immediately send a ping event. You should see a green ✓ next to the webhook if Jenkins received it correctly.

**Test it:**

```bash
# On your local machine
git commit --allow-empty -m "Test CI trigger"
git push origin main
# Watch Jenkins — a new build should start within a few seconds
```

---

## Section 4: Vercel Frontend Deployment

### 4.1 Install the Vercel CLI Locally

```bash
# On your local development machine (Windows PowerShell / Git Bash)
npm install -g vercel

vercel --version   # should print 33.x.x or later
```

### 4.2 Log In to Vercel

```bash
vercel login
# Choose "Continue with GitHub" — your browser will open for OAuth
# After authentication, return to the terminal and confirm
```

### 4.3 Link the Project

```bash
cd c:\Users\Mayank\OneDrive\Desktop\projects\YOYO\client

vercel link
# Prompts:
#   Set up and deploy? [Y/n] → Y
#   Which scope? → your account or team
#   Link to existing project? → N (first time) or Y (if already created)
#   Project name: yoyo-hotel-booking
#   Which directory is your code located in? → ./  (you are already in client/)
```

The command creates `client/.vercel/project.json` with your `orgId` and `projectId`. Copy these values into Jenkins credentials (Step 3.8).

### 4.4 Deploy to Production

```bash
cd c:\Users\Mayank\OneDrive\Desktop\projects\YOYO\client

vercel --prod
# Vercel will build the project and deploy it.
# The output will include the production URL:
#   ✅  Production: https://yoyo-hotel-booking.vercel.app [3s]
```

### 4.5 Set the Root Directory in Vercel Dashboard

If Vercel detects the wrong root (the monorepo root instead of `client/`):

1. Go to https://vercel.com/dashboard → select the `yoyo-hotel-booking` project.
2. **Settings → General → Root Directory** → set to `client`.
3. Click **Save**.
4. Redeploy.

### 4.6 Set Environment Variables in Vercel Dashboard

Go to **Settings → Environment Variables** and add:

| Variable Name           | Value                                     | Environments         |
|-------------------------|-------------------------------------------|----------------------|
| `VITE_API_URL`          | `https://api.yoyo.mayankcodes.dev`        | Production, Preview  |
| `VITE_RAZORPAY_KEY_ID`  | `rzp_live_REPLACE_WITH_REAL_KEY_ID`       | Production           |
| `VITE_RAZORPAY_KEY_ID`  | `rzp_test_REPLACE_WITH_TEST_KEY_ID`       | Preview              |
| `VITE_MAPBOX_TOKEN`     | `pk.eyJ1IjoibWF5YW5rIiwiYSI6…`           | Production, Preview  |
| `VITE_GOOGLE_CLIENT_ID` | `REPLACE.apps.googleusercontent.com`      | Production, Preview  |

Click **Save** after adding all variables. Trigger a new deployment for the variables to take effect.

### 4.7 Add the Custom Domain in Vercel

1. **Settings → Domains → Add**.
2. Type: `yoyo.mayankcodes.dev` → click **Add**.
3. Vercel will show the DNS records you need to create (handled in Section 5).

### 4.8 Retrieve Your Vercel Personal Access Token

1. Go to https://vercel.com/account/tokens.
2. Click **Create Token**.
3. Name: `YOYO Jenkins CI`
4. Scope: your team / account
5. Expiration: No Expiration (or 1 year)
6. Click **Create** → copy the token immediately (shown only once).
7. Add it to Jenkins as the `VERCEL_TOKEN` credential (Step 3.8).

---

## Section 5: Cloudflare DNS Setup

> **Important context:** Cloudflare offers both DNS resolution and HTTP proxying. For WebSocket connections used by Socket.io, proxying via Cloudflare creates problems unless you are on a paid plan with WebSocket support enabled. The safest configuration is **DNS-only** (grey cloud) for the API subdomain.

### 5.1 Log Into Cloudflare

1. Go to https://dash.cloudflare.com
2. Select the zone (domain): **mayankcodes.dev**
3. Navigate to **DNS → Records**.

### 5.2 DNS Records to Add

| Type  | Name          | Content / Value              | Proxy Status          | TTL  | Notes                                                         |
|-------|---------------|------------------------------|-----------------------|------|---------------------------------------------------------------|
| A     | `api.yoyo`    | `3.110.45.200`               | DNS only (grey cloud) | Auto | Backend API — must be DNS only for WebSocket/Socket.io        |
| CNAME | `yoyo`        | `cname.vercel-dns.com`       | Proxied (orange cloud)| Auto | Vercel frontend                                               |
| A     | `jenkins`     | `3.110.45.200`               | DNS only (grey cloud) | Auto | Jenkins UI — DNS only (no need to proxy CI traffic)           |
| A     | `@`           | `3.110.45.200`               | Proxied (orange cloud)| Auto | Root domain (optional, redirect to yoyo.mayankcodes.dev)      |
| CNAME | `www`         | `mayankcodes.dev`            | Proxied (orange cloud)| Auto | www redirect                                                  |

**How to add each record:**
1. Click **Add record**.
2. Select the Type from the dropdown.
3. Fill in Name and Content.
4. Toggle the **Proxy status** cloud icon (orange = proxied, grey = DNS only).
5. Click **Save**.

### 5.3 Why api.yoyo Must Be DNS-Only

When Cloudflare proxies a subdomain (orange cloud), all traffic goes through Cloudflare's edge servers. Cloudflare's **free plan** terminates WebSocket connections after a short idle timeout (100 seconds), and the standard HTTP proxy does not handle the WebSocket `Upgrade` header correctly in all cases.

Socket.io uses WebSockets (with a fallback to long-polling). If the connection drops after 100 seconds, users will experience:
- Disconnected real-time notifications
- Hotel availability updates stopping
- Broken booking confirmation flows

**Solution:** Set `api.yoyo` to **DNS only** (grey cloud). This means DNS resolves directly to your EC2 IP — Cloudflare is not in the traffic path. Your NGINX config on EC2 handles SSL termination and WebSocket upgrades correctly.

### 5.4 Configure SSL/TLS Mode in Cloudflare

1. **SSL/TLS → Overview → Encryption mode → Full (strict)**

This tells Cloudflare to connect to your origin over HTTPS and verify the certificate. Your Certbot certificate is trusted by Let's Encrypt, so this will work.

### 5.5 Page Rules — Always HTTPS

1. Go to **Rules → Page Rules → Create Page Rule**.
2. URL: `http://mayankcodes.dev/*`
3. Setting: **Always Use HTTPS**
4. Click **Save and Deploy**.

Repeat for `http://yoyo.mayankcodes.dev/*` if you want explicit coverage.

Alternatively, use **SSL/TLS → Edge Certificates → Always Use HTTPS** (toggle On) for a zone-wide rule that requires no Page Rules quota.

### 5.6 Verify DNS Propagation

Use these tools to confirm your DNS records are live:

```bash
# From any machine with dig installed
dig A api.yoyo.mayankcodes.dev
# Expected: 3.110.45.200

dig CNAME yoyo.mayankcodes.dev
# Expected: cname.vercel-dns.com

dig A jenkins.mayankcodes.dev
# Expected: 3.110.45.200
```

Online alternative: https://dnschecker.org — check from multiple global locations.

DNS propagation typically takes **1–5 minutes** within Cloudflare's network (their authoritative TTL is very short), but up to **48 hours** for other resolvers around the world.

---

## Section 6: Post-Deploy Checklist

Work through this checklist top-to-bottom after every fresh deployment.

### 6.1 Verify the API Health Endpoint

```bash
# From any machine
curl -s https://api.yoyo.mayankcodes.dev/api/health | python3 -m json.tool

# Expected response:
# {
#     "status": "ok",
#     "environment": "production",
#     "timestamp": "2026-07-22T07:00:00.000Z",
#     "uptime": 3600
# }
```

If you get a connection error, check:
1. `pm2 list` — is `yoyo-server` online?
2. `pm2 logs yoyo-server --lines 50` — any startup errors?
3. `sudo systemctl status nginx` — is NGINX running?
4. `sudo nginx -t` — is the NGINX config valid?
5. DNS — does `dig A api.yoyo.mayankcodes.dev` return `3.110.45.200`?

### 6.2 Test the Auth Flow

```bash
# Register a new user
curl -s -X POST https://api.yoyo.mayankcodes.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@12345"}' \
  | python3 -m json.tool

# Expected: { "success": true, "token": "eyJ...", "user": { ... } }

# Login with the same user
curl -s -X POST https://api.yoyo.mayankcodes.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@12345"}' \
  | python3 -m json.tool

# Expected: { "success": true, "token": "eyJ...", "user": { ... } }
```

### 6.3 Verify the Frontend Is Live

Open a browser and navigate to `https://yoyo.mayankcodes.dev`. Confirm:

- [ ] The page loads without errors
- [ ] The browser console has no CORS errors
- [ ] Network tab shows API calls going to `api.yoyo.mayankcodes.dev`
- [ ] WebSocket connection is established (Network tab → WS)

### 6.4 Check PM2 Process Status

```bash
# SSH into the EC2 instance
ssh -i ~/Downloads/yoyo-ec2-key.pem ubuntu@3.110.45.200

# Check all processes
pm2 list

# Live streaming logs (Ctrl+C to exit)
pm2 logs yoyo-server

# Last 100 lines of logs
pm2 logs yoyo-server --nostream --lines 100

# Process resource usage
pm2 monit
```

### 6.5 Check NGINX Access and Error Logs

```bash
# Access log (live stream)
sudo tail -f /var/log/nginx/access.log

# Error log (live stream)
sudo tail -f /var/log/nginx/error.log

# Last 100 error log lines
sudo tail -100 /var/log/nginx/error.log
```

### 6.6 Check SSL Certificate Status

```bash
# List all certificates
sudo certbot certificates

# Test renewal (dry run — no changes)
sudo certbot renew --dry-run

# Expected: Congratulations, all simulated renewals succeeded:
#   /etc/letsencrypt/live/api.yoyo.mayankcodes.dev/fullchain.pem (success)
#   /etc/letsencrypt/live/jenkins.mayankcodes.dev/fullchain.pem (success)
```

### 6.7 MongoDB Atlas: Whitelist the EC2 Elastic IP

If your Node.js server cannot connect to MongoDB, the EC2 IP may not be whitelisted.

1. Log into https://cloud.mongodb.com
2. Select your project → **Network Access** → **IP Access List**.
3. Click **Add IP Address**.
4. Enter: `3.110.45.200/32`
5. Comment: `yoyo-production EC2 Elastic IP`
6. Click **Confirm**.

The change takes effect within 1–2 minutes.

**Test the MongoDB connection from EC2:**

```bash
# Install mongosh if not present
npm install -g mongosh

mongosh "mongodb+srv://cluster0.abcde.mongodb.net/yoyo_production" \
    --username yoyo_admin \
    --password YOUR_REAL_PASSWORD \
    --eval "db.runCommand({ ping: 1 })"

# Expected: { ok: 1 }
```

### 6.8 Check Disk Space

The t2.micro only has 30 GiB. Monitor it regularly:

```bash
df -h /
# Should show < 70% usage after a fresh deploy

# Find what is taking space
du -sh /home/ubuntu/yoyo/node_modules || true
du -sh /var/log/
du -sh /var/lib/jenkins/

# Clean up old Jenkins builds if disk is low
# (Jenkins UI: Manage Jenkins → Manage Old Data)
```

### 6.9 Verify Jenkins Pipeline Ran Successfully

1. Open https://jenkins.mayankcodes.dev
2. Click the `YOYO-Production` job.
3. The latest build should show a **blue circle** (success) or **green checkmark** (Blue Ocean).
4. Click the build number → **Console Output** to review all stages.
5. Check the **Test Results** and **Coverage Report** links.

---

## Section 7: Environment Variables Reference

### 7.1 Server-Side Variables (EC2 — `server/.env`)

| Variable                    | Example Value                                                                       | Required | Description                                              |
|-----------------------------|--------------------------------------------------------------------------------------|----------|----------------------------------------------------------|
| `PORT`                      | `4000`                                                                               | ✅        | Express listen port                                      |
| `NODE_ENV`                  | `production`                                                                         | ✅        | Runtime environment                                      |
| `API_BASE_URL`              | `https://api.yoyo.mayankcodes.dev`                                                   | ✅        | Public API URL (no trailing slash)                       |
| `CLIENT_URL`                | `https://yoyo.mayankcodes.dev`                                                       | ✅        | Frontend URL for CORS                                    |
| `MONGODB_URI`               | `mongodb+srv://yoyo_admin:pass@cluster0.abcde.mongodb.net/yoyo_production?...`       | ✅        | MongoDB Atlas connection string                          |
| `DB_NAME`                   | `yoyo_production`                                                                    | ✅        | Database name                                            |
| `JWT_SECRET`                | `a3f8c...` (64 hex chars)                                                            | ✅        | Access token signing secret                              |
| `JWT_EXPIRES_IN`            | `7d`                                                                                 | ✅        | Access token TTL                                         |
| `JWT_REFRESH_SECRET`        | `b7d2e...` (64 hex chars)                                                            | ✅        | Refresh token signing secret                             |
| `JWT_REFRESH_EXPIRES_IN`    | `30d`                                                                                | ✅        | Refresh token TTL                                        |
| `SMTP_HOST`                 | `smtp.gmail.com`                                                                     | ✅        | SMTP server hostname                                     |
| `SMTP_PORT`                 | `587`                                                                                | ✅        | SMTP port                                                |
| `SMTP_SECURE`               | `false`                                                                              | ✅        | Use TLS directly (true for port 465)                     |
| `SMTP_USER`                 | `yoyo.noreply@gmail.com`                                                             | ✅        | SMTP username                                            |
| `SMTP_PASS`                 | `abcd efgh ijkl mnop` (App Password)                                                 | ✅        | SMTP password / App Password                             |
| `EMAIL_FROM`                | `"YOYO Hotel Booking <yoyo.noreply@gmail.com>"`                                      | ✅        | From address in outgoing emails                          |
| `RAZORPAY_KEY_ID`           | `rzp_live_XXXXXXXXXXXXXXXX`                                                          | ✅        | Razorpay public key                                      |
| `RAZORPAY_KEY_SECRET`       | `XXXXXXXXXXXXXXXXXXXXXXXX`                                                           | ✅        | Razorpay secret key                                      |
| `RAZORPAY_WEBHOOK_SECRET`   | `XXXXXXXXXXXXXXXXXXXXXXXX`                                                           | ✅        | Razorpay webhook verification secret                     |
| `AWS_ACCESS_KEY_ID`         | `AKIAIOSFODNN7EXAMPLE`                                                               | ⚠️        | AWS IAM access key (if using S3)                         |
| `AWS_SECRET_ACCESS_KEY`     | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`                                         | ⚠️        | AWS IAM secret key (if using S3)                         |
| `AWS_REGION`                | `ap-south-1`                                                                         | ⚠️        | AWS region (if using S3)                                 |
| `AWS_S3_BUCKET`             | `yoyo-hotel-assets-production`                                                       | ⚠️        | S3 bucket name                                           |
| `AWS_CLOUDFRONT_URL`        | `https://d1234567890abc.cloudfront.net`                                              | ❌        | CloudFront CDN URL (optional)                            |
| `SOCKET_ALLOWED_ORIGINS`    | `https://yoyo.mayankcodes.dev`                                                       | ✅        | Comma-separated Socket.io allowed origins                |
| `SOCKET_PING_TIMEOUT`       | `10000`                                                                              | ❌        | Socket.io ping timeout (ms)                              |
| `SOCKET_PING_INTERVAL`      | `25000`                                                                              | ❌        | Socket.io ping interval (ms)                             |
| `RATE_LIMIT_MAX`            | `100`                                                                                | ❌        | Requests per window                                      |
| `RATE_LIMIT_WINDOW_MINUTES` | `15`                                                                                 | ❌        | Rate limit window (minutes)                              |
| `LOGIN_RATE_LIMIT_MAX`      | `10`                                                                                 | ❌        | Login attempts per window                                |
| `LOG_LEVEL`                 | `info`                                                                               | ❌        | Winston log level                                        |
| `MORGAN_FORMAT`             | `combined`                                                                           | ❌        | HTTP request log format                                  |
| `SESSION_SECRET`            | `c9d1a...` (32 hex chars)                                                            | ⚠️        | Express session signing secret                           |
| `COOKIE_SECURE`             | `true`                                                                               | ✅        | HTTPS-only cookies                                       |
| `COOKIE_SAME_SITE`          | `lax`                                                                                | ❌        | SameSite cookie policy                                   |
| `COOKIE_MAX_AGE`            | `604800000`                                                                          | ❌        | Cookie max-age (ms)                                      |
| `ADMIN_EMAIL`               | `admin@yoyo.mayankcodes.dev`                                                         | ⚠️        | Seed script admin email                                  |
| `ADMIN_PASSWORD`            | `REPLACE_WITH_STRONG_ADMIN_PASSWORD`                                                 | ⚠️        | Seed script admin password                               |
| `GOOGLE_CLIENT_ID`          | `REPLACE.apps.googleusercontent.com`                                                 | ❌        | Google OAuth client ID                                   |
| `GOOGLE_CLIENT_SECRET`      | `REPLACE_WITH_GOOGLE_CLIENT_SECRET`                                                  | ❌        | Google OAuth client secret                               |
| `GOOGLE_CALLBACK_URL`       | `https://api.yoyo.mayankcodes.dev/auth/google/callback`                              | ❌        | Google OAuth redirect URL                                |
| `MAPBOX_ACCESS_TOKEN`       | `pk.eyJ1IjoibWF5YW5rIi…`                                                            | ❌        | Mapbox token (served via API)                            |

### 7.2 Client-Side Variables (Vercel — `client/.env` / Vercel Dashboard)

> All Vite client variables must be prefixed with `VITE_` to be embedded in the browser bundle.

| Variable                 | Example Value                                        | Required | Description                              |
|--------------------------|------------------------------------------------------|----------|------------------------------------------|
| `VITE_API_URL`           | `https://api.yoyo.mayankcodes.dev`                   | ✅        | Backend API base URL                     |
| `VITE_RAZORPAY_KEY_ID`   | `rzp_live_XXXXXXXXXXXXXXXX`                          | ✅        | Razorpay public key (safe to expose)     |
| `VITE_MAPBOX_TOKEN`      | `pk.eyJ1IjoibWF5YW5rIi…`                            | ❌        | Mapbox public token                      |
| `VITE_GOOGLE_CLIENT_ID`  | `REPLACE.apps.googleusercontent.com`                 | ❌        | Google OAuth client ID                   |
| `VITE_APP_NAME`          | `YOYO Hotel Booking`                                 | ❌        | App name shown in browser tab            |
| `VITE_APP_VERSION`       | `1.0.0`                                              | ❌        | App version (shown in footer)            |

### 7.3 Jenkins Credentials Summary

| Credential ID      | Kind                           | Value Source                         |
|--------------------|--------------------------------|--------------------------------------|
| `EC2_HOST`         | Secret Text                    | EC2 Elastic IP: `3.110.45.200`       |
| `EC2_USER`         | Secret Text                    | `ubuntu`                             |
| `EC2_SSH_KEY`      | SSH Username with private key  | Contents of `yoyo-ec2-key.pem`       |
| `VERCEL_TOKEN`     | Secret Text                    | Vercel Personal Access Token         |
| `VERCEL_ORG_ID`    | Secret Text                    | From `client/.vercel/project.json`   |
| `VERCEL_PROJECT_ID`| Secret Text                    | From `client/.vercel/project.json`   |

---

*End of YOYO Hotel Booking Deployment Guide.*
