# VirtuLab Kenya — Production Deployment & Cloud Infrastructure Guide 🚀

> **Target Platform:** VirtuLab Kenya — Web & PWA Virtual Chemistry Laboratory  
> **Production URL:** `https://virtulab.co.ke` (or cloud provider subdomain)  
> **Backend Architecture:** Node.js Express REST API + PostgreSQL 16  
> **Security Standard:** Helmet HTTP headers, bcrypt password hashing, JWT stateless authentication, Gzip/Brotli compression, rate limiting.

---

## 1. Cloud Deployment Options

### Option A: Railway (Recommended for Quick Pilot Deployment)

Railway provides integrated managed PostgreSQL and automatic GitHub continuous deployment.

1. **Sign in / Create Account:** Visit [railway.app](https://railway.app).
2. **Create New Project:** Click **"New Project"** → **"Deploy from GitHub repo"** → Select `virtulabkenya`.
3. **Add Database:** Click **"New"** → **"Database"** → Select **PostgreSQL**.
4. **Configure Web Service:**
   - In the settings of your web service, set **Root Directory** to `/server`.
   - Set **Start Command** to `node index.js`.
5. **Set Environment Variables:**
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (Railway automatically populates this link).
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `generate_a_random_64_char_secret_string`
   - `ADMIN_EMAIL`: `admin@virtulab.co.ke`
   - `ADMIN_PASSWORD`: `YourSecurePassword2026!`
   - `CORS_ORIGIN`: `https://virtulab.co.ke,https://your-app.up.railway.app`
6. **Automatic Migration:** On initial boot, `server/index.js` automatically executes `server/db/migrate.js` to ensure all relational tables, schema changes, and performance indexes are created.
7. **Verification:** Visit `https://your-app.up.railway.app/api/health` to confirm server status.

---

### Option B: Render Deployment

1. **Create Account:** Visit [render.com](https://render.com).
2. **New PostgreSQL:** Click **"New +"** → **"PostgreSQL"** → Name: `virtulab-db` → Plan: Free / Starter.
3. **New Web Service:**
   - Connect your GitHub repository.
   - **Environment:** `Node`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
4. **Add Environment Variables:**
   - `DATABASE_URL`: `Internal Database URL from Render Postgres`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `YourSecretKey`
   - `ADMIN_EMAIL`: `admin@virtulab.co.ke`
   - `ADMIN_PASSWORD`: `YourAdminPassword`
5. **Deploy:** Click **"Create Web Service"**.

---

### Option C: Docker & Docker Compose (Self-Hosted VPS / DigitalOcean / Linode)

To host on an Ubuntu 22.04/24.04 LTS server:

1. **Install Docker & Docker Compose:**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   sudo systemctl enable --now docker
   ```
2. **Clone Codebase:**
   ```bash
   git clone https://github.com/ed61609742025-code/virtulabkenya.git
   cd virtulabkenya
   ```
3. **Configure Environment:**
   ```bash
   cp server/.env.production.example server/.env
   # Edit server/.env with your production secrets
   ```
4. **Launch Containers:**
   ```bash
   docker-compose up -d --build
   ```
5. **Confirm Health:**
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## 2. Custom Domain & Nginx SSL Reverse Proxy (`virtulab.co.ke`)

### Nginx Virtual Host Configuration

Create `/etc/nginx/sites-available/virtulab.co.ke`:

```nginx
server {
    server_name virtulab.co.ke www.virtulab.co.ke;

    # Gzip & Performance
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Let's Encrypt SSL Installation

```bash
sudo ln -s /etc/nginx/sites-available/virtulab.co.ke /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d virtulab.co.ke -d www.virtulab.co.ke
```

---

## 3. Official Email & SMTP Configuration (`@virtulab.co.ke`)

VirtuLab Kenya automatically emails administrator welcome credentials and password resets to `@virtulab.co.ke` addresses via SMTP.

### Recommended Email Providers
1. **Google Workspace for Education / Business**:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_SECURE`: `false`
   - `SMTP_USER`: `admin@virtulab.co.ke`
   - `SMTP_PASS`: Generate an **App Password** from Google Account Security (requires 2-Step Verification).
2. **Zoho Mail**:
   - `SMTP_HOST`: `smtp.zoho.com`
   - `SMTP_PORT`: `587`
   - `SMTP_SECURE`: `false`
   - `SMTP_USER`: `admin@virtulab.co.ke`
   - `SMTP_PASS`: Zoho Account Application-Specific Password.
3. **cPanel Webmail (Domain Registrar Hosting)**:
   - `SMTP_HOST`: `mail.virtulab.co.ke`
   - `SMTP_PORT`: `465` (SSL, `SMTP_SECURE=true`) or `587` (TLS)
   - `SMTP_USER`: `admin@virtulab.co.ke`
   - `SMTP_PASS`: Mailbox password.

### Required Environment Variables
Add these to your production environment (Railway, Render, or Docker `.env`):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admin@virtulab.co.ke
SMTP_PASS=your_app_password_here
EMAIL_FROM="VirtuLab Kenya <admin@virtulab.co.ke>"
PLATFORM_URL=https://virtulab.co.ke
```

---

## 4. Google Identity Services (Student Google Sign-In)

VirtuLab Kenya supports Google Sign-In for Kenyan students.

### Setting Up Google OAuth Credentials
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials** → **OAuth client ID**.
3. Select Application type: **Web application**.
4. Set Name: `VirtuLab Kenya Student Portal`.
5. Under **Authorized JavaScript origins**, add:
   - `https://virtulab.co.ke`
   - `http://localhost:3000` (for local development)
6. Copy the generated **Client ID** and set it in your environment variables:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## 5. Database Backup & Disaster Recovery

Set up automated daily backups via crontab:

```bash
# Edit crontab
crontab -e

# Daily PostgreSQL backup at 02:00 AM EAT
0 2 * * * pg_dump -U virtulab_user -h localhost virtulabkenya | gzip > /var/backups/virtulab_$(date +\%Y\%m\%d).sql.gz
```

---

## 4. Operational Health & Telemetry Verification

- **System Health:** `GET /api/health`
- **Error Telemetry:** `GET /api/errors/recent` (Protected)
- **Research Summary:** `GET /api/research/analytics/summary` (Teacher/Admin)
- **Dataset Export:** `GET /api/research/export/csv` (Teacher/Admin)

---

*VirtuLab Kenya · Open University of Kenya · Master of Science in Learning Design & Technology*
