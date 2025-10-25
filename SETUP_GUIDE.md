# 🚀 NIDZP Design - Complete Setup Guide

This guide will help you configure and deploy the complete NIDZP Design portfolio with React app and AI-powered contact system.

---

## ✅ What's Done

### ✓ Express API (Deployed to Vercel)

- All 5 Contact API patches implemented
- AI-powered contact form analysis (Groq LLaMA 3.1)
- Concurrency control (semaphore limiting)
- Request validation and logging
- Health check endpoint
- **Live at**: https://sajt-reklama.vercel.app

### ✓ React Portfolio (Built, Ready to Deploy)

- Professional CV page with experience timeline
- Interactive ChatBot for lead capture
- Tailwind CSS styling with Inter font
- EmailJS integration prepared
- Responsive design
- **Local dev server running**: http://localhost:5173

---

## 🎯 Next Steps

### 1. Configure EmailJS (URGENT - Required for ChatBot)

The ChatBot currently has placeholder credentials. Follow these steps:

#### A. Create EmailJS Account (Free)

1. Go to https://www.emailjs.com/
2. Sign up (free tier: 200 emails/month)
3. Verify your email

#### B. Add Email Service

1. Dashboard → **Email Services** → **Add New Service**
2. Choose **Gmail** (recommended)
3. Click **Connect Account**
4. Authorize EmailJS to access your Gmail
5. **Copy SERVICE_ID** (e.g., `service_abc123`)

#### C. Create Email Template

1. Dashboard → **Email Templates** → **Create New Template**
2. Template name: `Portfolio Lead`
3. Template content:

   ```
   New Lead from NIDZP Design Portfolio

   Name: {{from_name}}
   Email: {{from_email}}
   Project Details: {{message}}

   ---
   Sent via ChatBot Widget
   ```

4. **Copy TEMPLATE_ID** (e.g., `template_xyz789`)

#### D. Get Public Key

1. Dashboard → **Account** → **General**
2. Find **Public Key** section
3. **Copy PUBLIC_KEY** (e.g., `user_ABcDEfGhIjKlMnO`)

#### E. Update ChatWidget.jsx

```bash
# Open file
code "c:\Users\Home\Desktop\sajt reklama\react-portfolio\src\components\ChatWidget.jsx"

# Find lines 77-79:
const serviceID = 'YOUR_SERVICE_ID';      // REPLACE
const templateID = 'YOUR_TEMPLATE_ID';    // REPLACE
const publicKey = 'YOUR_PUBLIC_KEY';      // REPLACE

# Replace with actual values from EmailJS dashboard
```

#### F. Test EmailJS Integration

```bash
# In react-portfolio folder
cd "c:\Users\Home\Desktop\sajt reklama\react-portfolio"
npm run dev

# Open http://localhost:5173
# Click chat button (bottom right)
# Enter test data:
#   Name: Test User
#   Email: test@example.com
#   Project: Testing EmailJS integration

# Check nikola.djokic@gmail.com inbox
# You should receive the test email
```

---

### 2. Deploy React Portfolio to Vercel

#### Option A: Separate Vercel Project (Recommended for Now)

```bash
# Install Vercel CLI (if not already)
npm install -g vercel

# Navigate to React folder
cd "c:\Users\Home\Desktop\sajt reklama\react-portfolio"

# Deploy to Vercel
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? nidzp-portfolio (or any name)
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod

# Vercel will give you URL like:
# https://nidzp-portfolio.vercel.app
```

#### Option B: Monorepo Deployment (Advanced)

This deploys both Express API and React portfolio from one repo:

1. **Update vercel.json**:

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "api/**/*.js", "use": "@vercel/node" },
    {
      "src": "react-portfolio/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/portfolio", "dest": "/react-portfolio/dist/index.html" },
    { "src": "/portfolio/(.*)", "dest": "/react-portfolio/dist/$1" },
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
}
```

2. **Add build script to root package.json**:

```json
{
  "scripts": {
    "build": "cd react-portfolio && npm install && npm run build"
  }
}
```

3. **Deploy**:

```bash
cd "c:\Users\Home\Desktop\sajt reklama"
git add .
git commit -m "Add React portfolio to monorepo"
git push
vercel --prod
```

---

### 6. Integrate ElectroGroup Site (Patch 6)

We've integrated a second static website (ElectroGroup) from the `nidzp/SajtEG` repository. This site is deployed separately on Vercel and linked via a redirect route.

#### A. How It Works

1. **Separate Deployment**: The SajtEG project is cloned, built, and deployed to its own Vercel project
2. **Simple Redirect**: The main Express server has a `/electrogroup` route that redirects to the Vercel URL
3. **Independent Maintenance**: Both sites remain separate codebases - no duplication

#### B. Deployed URLs

- **ElectroGroup Site**: https://nidzp-fjvjiii3t-nidzps-projects.vercel.app
- **Redirect Route**: https://sajt-reklama.vercel.app/electrogroup → redirects to ElectroGroup

#### C. How to Update ElectroGroup Site

```bash
# Navigate to SajtEG folder
cd "c:\Users\Home\Desktop\SajtEG"

# Make your changes to HTML/CSS/JS files
# ...

# Rebuild the project
npm run build

# Deploy to Vercel
vercel --prod

# Note the new URL if it changes
# Update the redirect in server.js if needed
```

#### D. How to Change Redirect URL

If Vercel gives you a different URL after redeployment:

1. Open `server.js` in the main project
2. Find the `/electrogroup` route (around line 170)
3. Update the redirect URL:

```javascript
app.get("/electrogroup", (req, res) => {
  res.redirect(301, "https://your-new-vercel-url.vercel.app");
});
```

4. Commit and push changes
5. Vercel will auto-deploy the updated redirect

#### E. Project Structure

```
Desktop/
├── sajt reklama/           # Main NIDZP Design project
│   ├── server.js           # Has /electrogroup redirect
│   ├── react-portfolio/    # React CV portfolio
│   └── api/                # Contact API endpoints
└── SajtEG/                 # ElectroGroup static site
    ├── index.html          # Homepage
    ├── intro.html          # Intro page with video
    ├── kontakt.html        # Contact form (FormSubmit)
    ├── dist/               # Build output (deployed to Vercel)
    └── vercel.json         # Vercel config
```

---

### 7. Clean Up Old Files

---

### 7. Clean Up Old Files

Run these commands to remove unnecessary files:

```powershell
cd "c:\Users\Home\Desktop\sajt reklama"

# Delete old files
Remove-Item -Path "index.backup.old.html" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "chatbot-service.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "Prompt for Codex_*.docx" -Force -ErrorAction SilentlyContinue

# Verify cleanup
Get-ChildItem -Name
```

---

### 8. Update Domain and Branding

#### A. Custom Domain (Optional)

1. Buy domain at Namecheap, GoDaddy, etc. (e.g., `nidzpdesign.com`)
2. Vercel Dashboard → Settings → Domains
3. Add custom domain
4. Update DNS records (Vercel provides instructions)

#### B. Update Favicon

```bash
# Replace default Vite logo
# Place your logo at: react-portfolio/public/favicon.ico
```

#### C. Update Meta Tags

Already done in `react-portfolio/index.html`:

```html
<title>NIDZP Design - Portfolio | Nikola Djokic</title>
<meta
  name="description"
  content="NIDZP Design - Profesionalni web development, dizajn i AI integracije. React, Node.js, video produkcija i digital marketing."
/>
```

---

### 9. Test Everything

#### Checklist:

**React Portfolio** (http://localhost:5173):

- [ ] Page loads with "NIDZP Design" header
- [ ] CV section shows 3 experience items
- [ ] Skills grid displays 12 skills
- [ ] Contact section shows email and location
- [ ] ChatBot button visible (bottom right)
- [ ] ChatBot opens on click
- [ ] ChatBot asks for name → email → project
- [ ] EmailJS sends email to nikola.djokic@gmail.com
- [ ] Responsive on mobile (test with browser DevTools)

**Express API** (https://sajt-reklama.vercel.app):

- [ ] `GET /api/health` returns `{"ok": true, ...}`
- [ ] `POST /api/contact` validates email
- [ ] `POST /api/contact` returns AI analysis
- [ ] Contact form page works: `/contact-form.html`
- [ ] `GET /electrogroup` redirects to ElectroGroup site (Patch 6)

**ElectroGroup Site** (https://nidzp-fjvjiii3t-nidzps-projects.vercel.app):

- [ ] Homepage loads with company info
- [ ] Intro page shows video
- [ ] Contact form works (FormSubmit integration)
- [ ] All images and assets load correctly

---

## 📚 Documentation

All documentation moved to `/docs/`:

- **CONTACT_API_PATCHES.md** - All 5 patches explained
- **DOMAIN_SETUP.md** - Custom domain setup
- **VERCEL_TROUBLESHOOTING.md** - Deployment issues
- **FINAL_REPORT.md** - Complete project report
- **TESTING.md** - Testing procedures

---

## 🔐 Environment Variables Summary

### Vercel (Express API)

```
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=production
CHATBOT_ENABLED=true
```

**Note**: Get your free Groq API key at https://console.groq.com/

### EmailJS (React Portfolio - Client-Side)

No environment variables needed. Credentials hardcoded in `ChatWidget.jsx` (client-side is safe for EmailJS public key).

---

## 🎨 Customization

### Change Colors

Edit `react-portfolio/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#9333ea',  // Purple
      secondary: '#2563eb', // Blue
    }
  }
}
```

### Add More Skills

Edit `react-portfolio/src/components/PortfolioPage.jsx`:

```jsx
// Find skills array (~line 120)
{[
  'React.js',
  'Node.js',
  'Your New Skill', // Add here
  ...
].map(...)}
```

### Change Email Destination

Edit `react-portfolio/src/components/ChatWidget.jsx`:

```jsx
// Line 82
to_email: "your-new-email@example.com";
```

---

## 🚧 Future Enhancements

- [ ] Add intro page with NIDZP Design logo animation
- [ ] Create 3D animations showcase (Three.js)
- [ ] Add services page
- [ ] Implement dark mode toggle
- [ ] Add portfolio projects gallery
- [ ] Integrate Google Analytics
- [ ] Add blog section (MDX)

---

## 💡 Tips

### Local Development Workflow

```bash
# Terminal 1: React Portfolio
cd react-portfolio
npm run dev
# http://localhost:5173

# Terminal 2: Express API
cd ..
npm start
# http://localhost:3000
```

### Quick Rebuild

```bash
cd react-portfolio
npm run build
# Builds to react-portfolio/dist/
```

### Check Errors

```bash
# React build errors
cd react-portfolio
npm run build

# Express API errors
cd ..
node server.js
```

---

## 📞 Support

**Nikola Djokic (NIDZP Design)**

- 📧 Email: nikola.djokic@gmail.com
- 📍 Location: Sombor, Serbia

---

## ✅ Completion Checklist

- [x] Express API deployed to Vercel
- [x] All 5 Contact API patches implemented
- [x] React portfolio created with Vite
- [x] Tailwind CSS configured
- [x] ChatWidget component created
- [x] PortfolioPage component created
- [x] Inter font integrated
- [x] EmailJS prepared (needs user credentials)
- [x] Documentation organized to /docs/
- [x] Old files cleaned up
- [x] **Patch 6: ElectroGroup site integrated** (NEW!)
- [x] ElectroGroup deployed to Vercel
- [x] /electrogroup redirect route added
- [ ] **EmailJS configured** (YOU MUST DO THIS)
- [ ] **React portfolio deployed** (RECOMMENDED)
- [ ] Custom domain connected (OPTIONAL)

---

**Last Updated**: 2024-01-25
**Status**: Ready for EmailJS configuration and deployment

---

**Built with ❤️ by NIDZP Design**
