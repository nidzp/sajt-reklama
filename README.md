# 🎯 Sajt Reklama Platform

Moderna platforma za prikaz i upravljanje reklamama sa admin panelom i GDPR cookie consent sistemom.

## ✨ Features

- 📱 **Responsive dizajn** - Radi na svim uređajima
- 🎨 **Moderan UI** - Gradient animacije i smooth transitions
- 🛡️ **Sigurnost** - Helmet, CORS, Rate Limiting, Input validation
- 🍪 **GDPR Compliant** - Cookie consent sa podešavanjima
- 📊 **Analytics Ready** - Google Analytics integracija
- 🚀 **Vercel Ready** - Konfigurisan za instant deployment
- ⚡ **API** - RESTful API sa error handling-om

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

## 🔧 Environment Variables

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.vercel.app
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ads` | Dohvati sve reklame |
| POST | `/api/ads` | Dodaj novu reklamu |
| DELETE | `/api/ads/:id` | Obriši reklamu |
| GET | `/api/health` | Health check |

### Primer POST request:

```javascript
fetch('/api/ads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: 'https://example.com/image.jpg',
    link: 'https://example.com'
  })
})
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

## 📁 Struktura Projekta
