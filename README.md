# 🎯 Sajt Reklama Platform

Moderna platforma za prikaz i upravljanje reklamama sa **AI chatbot** asistentom, admin panelom i GDPR cookie consent sistemom.

## ✨ Features

- 📱 **Responsive dizajn** - Radi na svim uređajima
- 🎨 **Moderan UI** - Gradient animacije i smooth transitions
- 🛡️ **Sigurnost** - Helmet, CORS, Rate Limiting, Input validation
- 🍪 **GDPR Compliant** - Cookie consent sa podešavanjima
- 📊 **Analytics Ready** - Google Analytics integracija
- 🚀 **Vercel Ready** - Konfigurisan za instant deployment
- ⚡ **API** - RESTful API sa error handling-om
- 🤖 **AI Chatbot** - Groq-powered korisnički servis sa fallback odgovorima

## 📦 Instalacija

```bash
# Clone repo
git clone https://github.com/your-username/sajt-reklama.git
cd sajt-reklama

# Install dependencies
npm install

# Create .env file (already exists)
# Add your settings to .env

# Run development server
npm run dev

# Run production server
npm start
```

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Pošalji poruku AI chatbot-u |
| GET | `/api/chat/status` | Status chatbot servisa |

#### Chat Request Example:

```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Kako da postavim reklamu?',
    history: [
      { role: 'user', content: 'Zdravo' },
      { role: 'assistant', content: 'Zdravo! Kako mogu da pomognem?' }
    ]
  })
})
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

## 🚀 Deployment na Vercel

### Automatski (preporučeno):

1. Push na GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. Idi na [vercel.com](https://vercel.com)
3. Import GitHub repository
4. Dodaj Environment Variables:
   - `NODE_ENV` = `production`
   - `ALLOWED_ORIGINS` = `https://your-domain.vercel.app`
   - `GOOGLE_ANALYTICS_ID` = `G-XXXXXXXXXX`
5. Deploy!

### Manual:

```bash
npm install -g vercel
vercel login
vercel
```

### Environment Variables za Vercel:

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.vercel.app
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GROQ_API_KEY=gsk_your_actual_key_here
AI_MODEL=llama3-8b-8192
CHATBOT_ENABLED=true
```

## 📁 Struktura Projekta
