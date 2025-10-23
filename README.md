# MAX Portfolio - AI-Powered Business Launch Platform 🚀

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nidzp/sajt-reklama)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/nidzp/sajt-reklama)

## 🌟 Overview

MAX Portfolio is a showcase platform demonstrating AI-powered web development with seamless GitHub, Vercel, and LM Studio integration. The project includes multiple demo sites showcasing different business use cases.

### Featured Sites

1. **MAX Portfolio Hub** (`portfolio.html`) - Central platform showcasing all projects
2. **Vespera Hearth Bakery** (`index.html`) - Full e-commerce demo with interactive catalog
3. **Neural Sprint Studio** (`about.html`) - AI-native portfolio site

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Styling:** Custom CSS with CSS Variables
- **i18n:** English & Serbian language support
- **Testing:** Playwright
- **Version Control:** Git/GitHub
- **Hosting:** Vercel
- **AI Integration:** LM Studio ready

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**

```bash
git clone https://github.com/nidzp/sajt-reklama.git
cd sajt-reklama
```

2. **Install dependencies:**

```bash
npm install
```

3. **Open in browser:**
   Simply open any HTML file in your browser:

- `portfolio.html` - Main portfolio hub
- `index.html` - Vespera Bakery demo
- `about.html` - Neural Sprint Studio

### Live Preview

You can also use a local server:

```bash
npx serve
```

Then visit `http://localhost:3000`

## 📦 Deployment

### Deploy to Vercel (Recommended)

#### Method 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nidzp/sajt-reklama)

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Method 3: GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Deploy"

### Deploy to GitHub Pages

1. Go to repository Settings
2. Navigate to Pages
3. Select source branch (main)
4. Select folder (root)
5. Save

Your site will be available at: `https://nidzp.github.io/sajt-reklama/`

## 🤖 LM Studio Integration

### Setup LM Studio

1. **Download LM Studio:** [lmstudio.ai](https://lmstudio.ai)

2. **Install a model:**

   - Recommended: Llama 3, Mistral, or CodeLlama
   - Download through LM Studio UI

3. **Start local server:**

```bash
# In LM Studio, go to "Local Server" tab
# Click "Start Server"
# Default: http://localhost:1234
```

4. **API Integration:**

```javascript
// Example: Generate content with LM Studio
const response = await fetch("http://localhost:1234/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "llama-3",
    messages: [{ role: "user", content: "Generate product description" }],
  }),
});
```

## 📁 Project Structure

```
sajt-reklama/
├── index.html              # Vespera Hearth Bakery demo
├── about.html              # Neural Sprint Studio
├── portfolio.html          # MAX Portfolio Hub (NEW!)
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── app.js              # Main JavaScript
│   └── app.new.js          # Additional scripts
├── assets/
│   └── img/                # Images
├── scripts/
│   └── test_lightbox.js    # Tests
├── package.json            # Dependencies
└── README.md               # This file
```

## 🎨 Features

### MAX Portfolio Hub

- ✨ Showcase of all demo projects
- 🔗 Direct links to GitHub, Vercel, LM Studio
- 📱 Fully responsive design
- 🌐 Bilingual support (EN/SR)
- 🚀 Project launch form

### Vespera Hearth Bakery

- 🛒 Interactive product catalog
- 📋 Order system with cart
- 🖼️ Lightbox gallery
- 📝 Blog/stories section
- 📬 Contact forms

### Neural Sprint Studio

- 💼 Portfolio showcase
- ⚡ 60-minute sprint methodology
- 📊 Service breakdown
- 🎯 Client testimonials

## 🔧 Configuration

### Vercel Configuration (`vercel.json`)

Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### Environment Variables

For LM Studio integration, add to Vercel:

```
LM_STUDIO_API_URL=http://localhost:1234
LM_STUDIO_MODEL=llama-3
```

## 🧪 Testing

Run Playwright tests:

```bash
npm test
```

## 📝 Customization

### Change Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
  --color-accent: #8a5cff; /* Primary accent */
  --color-bg: #0d0616; /* Background */
  --color-text: #f5f2ff; /* Text color */
}
```

### Add New Pages

1. Create new HTML file
2. Link in navigation
3. Use existing CSS classes
4. Add to deployment config

## 🌍 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 🔗 Links

- **Live Demo:** [Coming soon on Vercel]
- **GitHub:** [github.com/nidzp/sajt-reklama](https://github.com/nidzp/sajt-reklama)
- **LM Studio:** [lmstudio.ai](https://lmstudio.ai)
- **Vercel:** [vercel.com](https://vercel.com)

## 📞 Contact

For project inquiries, collaboration, or support:

- GitHub: [@nidzp](https://github.com/nidzp)
- Project: [sajt-reklama](https://github.com/nidzp/sajt-reklama)

## 🎯 Roadmap

- [x] Create MAX Portfolio Hub
- [x] GitHub repository setup
- [ ] Deploy to Vercel
- [ ] LM Studio API integration
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] Progressive Web App (PWA) support

---

**Built with 💜 using AI-powered development**

_From concept to production in minutes with GitHub, Vercel & LM Studio_
