# VirtuLab Kenya — Deployment Guide

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/ed61609742025-code/virtulabkenya.git
cd virtulabkenya/server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Set up PostgreSQL database
```bash
# Create the database
createdb virtulabkenya

# Run the schema
psql virtulabkenya < db/schema.sql
```

### 5. Start the server
```bash
npm run dev   # development (auto-restarts on changes)
npm start     # production
```

### 6. Test the server
Open: http://localhost:3000/api/health  
You should see: `{"status":"ok","project":"VirtuLab Kenya",...}`

---

## Deployment to Railway (Free Hosting)

1. Create a free account at railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select `virtulabkenya`
4. Set the root directory to `server`
5. Add environment variables in Railway's dashboard (copy from .env.example)
6. Railway will give you a public URL — your server is live

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| PORT | Server port | 3000 |
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| JWT_SECRET | Secret key for JWT signing (keep private!) | a_long_random_string |
| JWT_EXPIRES_IN | How long tokens last | 7d |
| NODE_ENV | Environment | development or production |
