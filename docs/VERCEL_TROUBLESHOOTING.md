# Vercel Deployment Troubleshooting Guide

## 🚨 DEPLOYMENT_NOT_FOUND Error - Resolved

### Problem

Vercel vraća `DEPLOYMENT_NOT_FOUND` (404) grešku pri pokušaju pristupa sajtu.

### Root Cause Analysis

1. **Neispravna `vercel.json` konfiguracija** - koristili smo deprecated `rewrites` sintaksu koja pokušava da preusmeri sve zahteve na `server.js` koji nije serverless funkcija
2. **Missing static file serving** - Vercel nije znao gde da pronađe HTML fajlove
3. **File structure mismatch** - HTML fajlovi su u `/public/` ali konfiguracija nije bila tačna

---

## ✅ Solution Applied

### 1. Updated `vercel.json`

**Stara konfiguracija (POGREŠNA)**:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/server.js"
    }
  ]
}
```

**Nova konfiguracija (ISPRAVNA)**:

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "public": true
}
```

### Što ova promena radi:

- ✅ `cleanUrls: true` - omogućava pristup `/portfolio` umesto `/portfolio.html`
- ✅ `trailingSlash: false` - uklanja trailing slash sa URL-ova
- ✅ `public: true` - označava da je ovo public static site (omogućava listing direktorijuma)

---

### 2. File Structure

```
sajt-reklama/
├── api/                    # Serverless funkcije (Vercel automatski detektuje)
│   ├── groq-chat.js       # AI chatbot endpoint
│   ├── health.js          # Health check
│   └── chat.js            # Stari chat endpoint
├── public/                 # Static HTML fajlovi
│   ├── index.html         # Homepage
│   ├── portfolio.html     # Portfolio stranica
│   ├── contact.html       # Contact stranica
│   └── chatbot.html       # AI Chatbot stranica
├── assets/                 # CSS, JS, slike
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── img/
├── server.js              # Lokalni development server (NIJE za Vercel)
├── package.json           # Dependencies
└── vercel.json            # Vercel konfiguracija
```

---

### 3. Kako Vercel Sada Radi

#### Automatsko Detektovanje:

1. **Static Files** (`/public/`):

   - Vercel automatski serve-uje sve fajlove iz `/public/` direktorijuma
   - `index.html` → `https://sajt-reklama.vercel.app/`
   - `portfolio.html` → `https://sajt-reklama.vercel.app/portfolio`
   - `contact.html` → `https://sajt-reklama.vercel.app/contact`
   - `chatbot.html` → `https://sajt-reklama.vercel.app/chatbot`

2. **Serverless Functions** (`/api/`):

   - Svaki `.js` fajl u `/api/` postaje serverless endpoint
   - `groq-chat.js` → `https://sajt-reklama.vercel.app/api/groq-chat`
   - `health.js` → `https://sajt-reklama.vercel.app/api/health`

3. **Assets** (CSS, JS, slike):
   - Vercel automatski serve-uje iz root direktorijuma
   - `/assets/css/styles.css` → `https://sajt-reklama.vercel.app/assets/css/styles.css`

---

## 🔧 Common Vercel Configuration Patterns

### Pattern 1: Static Site (Current Setup)

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

**Use case**: Pure static HTML sites sa serverless API funkcijama

---

### Pattern 2: Redirects

```json
{
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

---

### Pattern 3: Rewrites (za API proxy)

```json
{
  "rewrites": [
    {
      "source": "/api/external/:path*",
      "destination": "https://external-api.com/:path*"
    }
  ]
}
```

**Note**: Koristi SAMO za proxying ka eksternim API-jima, ne za internal routing!

---

### Pattern 4: Headers (CORS, Security)

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,POST,PUT,DELETE"
        }
      ]
    }
  ]
}
```

---

## 🚀 Deployment Workflow

### Local Development:

```bash
# Start local server (koristi server.js sa Express)
node server.js
# ili
npm run dev

# Pristup: http://localhost:3000
```

### Vercel Deployment:

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>
```

---

## 📊 Verification Checklist

Po deploy-u na Vercel, proveri:

- [x] **Homepage**: https://sajt-reklama.vercel.app/
- [x] **Portfolio**: https://sajt-reklama.vercel.app/portfolio
- [x] **Contact**: https://sajt-reklama.vercel.app/contact
- [x] **AI Chatbot**: https://sajt-reklama.vercel.app/chatbot
- [x] **API Health**: https://sajt-reklama.vercel.app/api/health
- [x] **Groq Chat API**: https://sajt-reklama.vercel.app/api/groq-chat
- [x] **CSS Loading**: Proveri da li se učitava `/assets/css/styles.css`
- [x] **JS Loading**: Proveri da li se učitava `/assets/js/main.js`
- [x] **SSL Certificate**: HTTPS radi ispravno
- [x] **Console Errors**: Proveri browser console (F12)

---

## 🛡️ Environment Variables (Vercel Dashboard)

Idi na: https://vercel.com/nidzps-projects/sajt-reklama/settings/environment-variables

Dodaj:

```
GROQ_API_KEY = <your-api-key-from-env-file>
AI_MODEL = llama-3.1-8b-instant
CHATBOT_ENABLED = true
ALLOWED_ORIGINS = https://sajt-reklama.vercel.app,https://if0-40249576.infinityfreeapp.com
NODE_ENV = production
```

**VAŽNO**: Posle dodavanja env variables, **redeploy-uj**:

```bash
vercel --prod
```

---

## 🔍 Debugging Vercel Errors

### Error: DEPLOYMENT_NOT_FOUND (404)

**Uzrok**: Fajl ne postoji ili je routing pogrešan
**Fix**:

1. Proveri da fajl postoji u `/public/`
2. Proveri `vercel.json` routing
3. Proveri da li je deployment uspešan: `vercel ls`

### Error: FUNCTION_INVOCATION_FAILED (500)

**Uzrok**: Serverless funkcija ima grešku
**Fix**:

1. Proveri logs: `vercel logs <deployment-url>`
2. Proveri da li export-uješ default handler:
   ```js
   export default async function handler(req, res) { ... }
   ```
3. Proveri environment variables

### Error: FUNCTION_INVOCATION_TIMEOUT (504)

**Uzrok**: Funkcija traje duže od 10s (Hobby plan) ili 60s (Pro)
**Fix**:

1. Optimizuj kod
2. Dodaj timeout config u `vercel.json`:
   ```json
   {
     "functions": {
       "api/slow-function.js": {
         "maxDuration": 60
       }
     }
   }
   ```

### Error: DNS_HOSTNAME_NOT_FOUND (502)

**Uzrok**: Custom domain nije konfigurisan
**Fix**:

1. Dodaj domain u Vercel dashboard
2. Konfiguriši DNS zapise (A ili CNAME)
3. Sačekaj DNS propagaciju (24-48h)

---

## 📝 Best Practices

1. **File Organization**:

   - HTML → `/public/`
   - API endpoints → `/api/`
   - Assets → `/assets/` ili `/public/assets/`
   - Config → root (`vercel.json`, `package.json`)

2. **vercel.json Simplicity**:

   - Koristi minimalno konfiguracije
   - Vercel automatski detektuje većinu stvari
   - Samo dodaj custom rules ako je potrebno

3. **Environment Variables**:

   - NIKAD ne commit-uj secrets u git
   - Dodaj u Vercel dashboard
   - Koristi `.env` samo za local development

4. **Deployment Frequency**:
   - Test lokalno prvo: `node server.js`
   - Preview deployment za testing: `vercel`
   - Production deploy kad si siguran: `vercel --prod`

---

## 🎯 Current Status

✅ **RESOLVED**: DEPLOYMENT_NOT_FOUND error  
✅ **Configuration**: Simplified `vercel.json`  
✅ **File Structure**: Ispravno organizovano  
✅ **Static Files**: Svi HTML fajlovi rade  
✅ **API Endpoints**: Groq chatbot endpoint funkcionalan  
✅ **SSL**: HTTPS aktivan  
✅ **CORS**: Konfigurisan za localhost + Vercel + InfinityFree

**Live URL**: https://sajt-reklama.vercel.app  
**Latest Deployment**: https://sajt-reklama-2tr4b6pb3-nidzps-projects.vercel.app  
**Git Commit**: 7770d8f

---

## 📚 References

- [Vercel Configuration](https://vercel.com/docs/projects/project-configuration)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vercel Error Codes](https://vercel.com/docs/errors)
- [Static File Serving](https://vercel.com/docs/frameworks/more-frameworks#static-sites)
