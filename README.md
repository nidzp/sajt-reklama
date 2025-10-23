# 🎯 Sajt Reklama Platform

Moderna platforma za prikaz i upravljanje reklamama sa **AI chatbot** asistentom, admin panelom i GDPR cookie consent sistemom.

## 🚀 Live Demo

**🌐 Production:** [sajt-reklama.vercel.app](https://sajt-reklama.vercel.app)

## ✨ Features

- 📱 **Responsive dizajn** - Radi na svim uređajima
- 🎨 **Moderan UI** - Gradient animacije i smooth transitions
- 🛡️ **Sigurnost** - Helmet, CORS, Rate Limiting, Input validation
- 🍪 **GDPR Compliant** - Cookie consent sa podešavanjima
- 📊 **Analytics Ready** - Google Analytics integracija
- 🚀 **Vercel Ready** - Konfigurisan za instant deployment
- ⚡ **API** - RESTful API sa error handling-om
- 🤖 **AI Chatbot** - Groq-powered korisnički servis sa fallback odgovorima

## 📂 Project Structure

```
sajt-reklama/
├── public/              # Main application files (served on Vercel)
│   ├── index.html       # Landing page with ads display
│   ├── upload.html      # Upload new advertisement form
│   ├── chatbot.js       # AI chatbot widget
│   ├── chatbot-styles.css
│   ├── cookie-consent.js
│   └── cookie-styles.css
├── css/                 # Shared stylesheets
│   └── styles.css       # Main CSS with dark theme
├── js/                  # JavaScript modules
│   └── app.js           # Portfolio/demo site scripts
├── assets/              # Images and static files
│   └── img/
├── server.js            # Express backend API
├── chatbot-service.js   # AI chatbot logic (Groq SDK)
├── ads.json             # Advertisement database (file-based)
├── vercel.json          # Vercel deployment config
├── index.html           # Bakery demo (Vespera Hearth)
├── about.html           # AI portfolio page
├── portfolio.html       # MAX Portfolio showcase
└── README.md            # This file
```

## 📦 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))
- **Groq API Key** (Free - [Get it here](https://console.groq.com/))

### Installation

```bash
# 1. Clone repository
git clone https://github.com/nidzp/sajt-reklama.git
cd sajt-reklama

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Add your Groq API key to .env
# GROQ_API_KEY=gsk_your_actual_api_key_here

# 5. Run development server
npm run dev

# Server running on http://localhost:3000
```

### Verifying Installation

1. Open `http://localhost:3000` - Should see landing page with features
2. Open `http://localhost:3000/upload.html` - Upload form
3. Click chatbot button (bottom right) - AI assistant widget
4. Check terminal for: `✓ AI Chatbot enabled with Groq (llama3-8b-8192)`

## 🤖 AI Chatbot

Chatbot koristi **Groq AI** (besplatno) sa fallback sistemom:

### Dobijanje Groq API Key (BESPLATNO):

1. Idi na https://console.groq.com/
2. Registruj se (besplatno)
3. Kreiraj API key
4. Dodaj u `.env` fajl

### Features:

- ⚡ Ultra brzi odgovori (Groq je najbrži AI)
- 🔄 Automatski fallback na statične odgovore
- 💬 Conversational AI sa kontekstom
- 📱 Responsive chat widget
- ⌨️ Typing indicators
- 🎯 Quick action buttons
- 📊 Pametno prepoznavanje namere

### Podržane teme:

- Kako postaviti reklamu
- Cene i paketi
- Kontakt informacije
- Tehnička podrška
- Opšta pitanja

## 🔧 Environment Variables

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.vercel.app
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# AI Chatbot
GROQ_API_KEY=gsk_your_api_key_here
AI_MODEL=llama3-8b-8192
CHATBOT_ENABLED=true
```

## 📦 Instalacija

```bash
# Install dependencies (uključuje groq-sdk)
npm install

# Get your free Groq API key
# https://console.groq.com/

# Add to .env file
GROQ_API_KEY=your_actual_key_here

# Run
npm run dev
```

## 🌐 API Endpoints

| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| GET    | `/api/ads`     | Dohvati sve reklame |
| POST   | `/api/ads`     | Dodaj novu reklamu  |
| DELETE | `/api/ads/:id` | Obriši reklamu      |
| GET    | `/api/health`  | Health check        |

### Chatbot Endpoints:

| Method | Endpoint           | Description                 |
| ------ | ------------------ | --------------------------- |
| POST   | `/api/chat`        | Pošalji poruku AI chatbot-u |
| GET    | `/api/chat/status` | Status chatbot servisa      |

#### Chat Request Example:

```javascript
fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Kako da postavim reklamu?",
    history: [
      { role: "user", content: "Zdravo" },
      { role: "assistant", content: "Zdravo! Kako mogu da pomognem?" },
    ],
  }),
});
```

#### Chat Response:

```json
{
  "message": "Da postavite reklamu, sledite ove korake...",
  "source": "ai",
  "model": "llama3-8b-8192",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚀 Deployment to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Connect Vercel:**

   - Go to [vercel.com](https://vercel.com) and login
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects settings from `vercel.json`

3. **Add Environment Variables:**
   In Vercel dashboard → Settings → Environment Variables:

   | Variable              | Value                         | Description                                 |
   | --------------------- | ----------------------------- | ------------------------------------------- |
   | `NODE_ENV`            | `production`                  | Environment mode                            |
   | `ALLOWED_ORIGINS`     | `https://your-app.vercel.app` | CORS allowed origins                        |
   | `GROQ_API_KEY`        | `gsk_your_actual_key`         | Groq API key (get free at console.groq.com) |
   | `AI_MODEL`            | `llama3-8b-8192`              | AI model to use                             |
   | `CHATBOT_ENABLED`     | `true`                        | Enable/disable chatbot                      |
   | `GOOGLE_ANALYTICS_ID` | `G-XXXXXXXXXX`                | (Optional) GA4 tracking ID                  |

4. **Deploy:**
   - Click "Deploy"
   - Wait ~60 seconds
   - Visit your live site!

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add GROQ_API_KEY
vercel env add NODE_ENV production
vercel env add CHATBOT_ENABLED true

# Deploy to production
vercel --prod
```

### Troubleshooting Vercel Deployment

**404 NOT_FOUND Error:**

- ✅ Fixed in `vercel.json` with proper static file serving
- Check that `vercel.json` includes builds for `public/`, `css/`, `js/`, `assets/`

**API not working:**

- Verify environment variables are set in Vercel dashboard
- Check Vercel logs: Dashboard → Deployments → [Latest] → View Function Logs

**Chatbot not responding:**

- Ensure `GROQ_API_KEY` is set correctly
- Chatbot will use fallback responses if API key is missing
- Test status endpoint: `https://your-app.vercel.app/api/chat/status`

## 🧪 Testing Your Deployment

### Quick Smoke Test (2 minutes)

1. **Visit Homepage:**

   ```
   https://sajt-reklama.vercel.app/
   ```

   - ✅ Purple gradient theme loads
   - ✅ "Sajt Reklama Platform" title visible
   - ✅ Features section shows 6 cards
   - ✅ Demo ads display in grid

2. **Test Upload:**

   ```
   https://sajt-reklama.vercel.app/upload.html
   ```

   - ✅ Form visible with 2 input fields
   - ✅ Preview updates when typing image URL
   - ✅ Submit creates new ad

3. **Test AI Chatbot:**

   - ✅ Chat widget button (bottom right corner)
   - ✅ Click opens chat window
   - ✅ Type "Kako da postavim reklamu?" and press Enter
   - ✅ Bot responds (or shows fallback message)

4. **Test API:**
   ```bash
   curl https://sajt-reklama.vercel.app/api/health
   # Should return: {"status":"ok","chatbot":true,...}
   ```

### Full Testing Suite

```bash
# Test all endpoints
curl https://sajt-reklama.vercel.app/api/health
curl https://sajt-reklama.vercel.app/api/ads
curl https://sajt-reklama.vercel.app/api/chat/status

# Test chatbot
curl -X POST https://sajt-reklama.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Zdravo","history":[]}'
```

## 📁 Struktura Projekta
