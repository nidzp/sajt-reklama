# Sajt Reklama Platform

Modern advertising platform with admin panel and cookie consent.

## Features

- 📱 Responsive ad display
- 🎨 Modern UI with animations
- 🛡️ Security features (Helmet, CORS, Rate Limiting)
- 🍪 GDPR-compliant cookie consent
- 📊 Analytics integration ready
- 🚀 Vercel deployment ready

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` file:

   ```env
   PORT=3000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000
   GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

3. Run development server:

   ```bash
   npm run dev
   ```

4. Build and deploy to Vercel:

   ```bash
   vercel
   ```

## API Endpoints

- `GET /api/ads` - Get all ads
- `POST /api/ads` - Create new ad
- `DELETE /api/ads/:id` - Delete ad
- `GET /api/health` - Health check

## Security

- Rate limiting enabled
- CORS configured
- Helmet security headers
- Input validation
- Error handling

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Environment variables needed:

- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://your-domain.vercel.app`
- `GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX`

## License

MIT
