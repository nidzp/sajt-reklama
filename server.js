require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs").promises;
const path = require("path");

// Initialize chatbot with error handling
let chatbot;
try {
  chatbot = require("./chatbot-service");
} catch (error) {
  console.error("⚠ Chatbot service failed to load:", error.message);
  // Create fallback chatbot
  chatbot = {
    enabled: false,
    chat: async (message) => ({
      response: "Za pomoć kontaktirajte: info@sajt-reklama.rs",
      source: "fallback",
      model: "none",
    }),
    getFallbackResponse: () => "Za pomoć kontaktirajte: info@sajt-reklama.rs",
  };
}

const app = express();
const PORT = process.env.PORT || 3000;
const ADS_FILE = path.join(__dirname, "ads.json");

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://www.googletagmanager.com",
        ],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https://www.google-analytics.com"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration - more permissive for Vercel
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

// Add Vercel preview URLs
const isVercel = process.env.VERCEL === "1";

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Allow Vercel preview URLs
      if (isVercel && origin.includes(".vercel.app")) {
        return callback(null, true);
      }

      // Check allowed origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(null, true); // Allow all in production for now
      }
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Previše zahteva. Pokušajte ponovo za 15 minuta." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Previše upload-a. Pokušajte ponovo za 1 sat." },
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: "Previše poruka. Sačekajte trenutak." },
});

app.use("/api/", limiter);
app.use(express.json({ limit: "10mb" }));

// Serve static files from ROOT (CSS, JS, Assets)
app.use(
  express.static(__dirname, {
    maxAge: "1d",
    etag: true,
  })
);

// Serve static files from public directory
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d",
    etag: true,
  })
);

// Explicitly serve chatbot and cookie files
app.get("/chatbot.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chatbot.js"));
});
app.get("/chatbot-styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chatbot-styles.css"));
});
app.get("/cookie-consent.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cookie-consent.js"));
});
app.get("/cookie-styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cookie-styles.css"));
});

// Initialize ads.json if it doesn't exist
async function initAdsFile() {
  try {
    await fs.access(ADS_FILE);
    console.log("✓ ads.json exists");
  } catch {
    await fs.writeFile(ADS_FILE, JSON.stringify([], null, 2));
    console.log("✓ Created ads.json file");
  }
}

// Read ads from file
async function readAds() {
  try {
    const data = await fs.readFile(ADS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading ads:", error);
    return [];
  }
}

// Write ads to file
async function writeAds(ads) {
  try {
    await fs.writeFile(ADS_FILE, JSON.stringify(ads, null, 2));
  } catch (error) {
    console.error("Error writing ads:", error);
    throw error;
  }
}

// Validation helper
function validateAd(ad) {
  if (!ad.image || typeof ad.image !== "string" || ad.image.trim() === "") {
    return { valid: false, error: "Valid image URL is required" };
  }
  if (!ad.link || typeof ad.link !== "string" || ad.link.trim() === "") {
    return { valid: false, error: "Valid link URL is required" };
  }

  // Basic URL validation
  try {
    new URL(ad.link);
    new URL(ad.image);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  return { valid: true };
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    chatbot: chatbot.enabled,
    version: "1.0.0",
  });
});

// Ads endpoints
app.get("/api/ads", async (req, res) => {
  try {
    const ads = await readAds();
    res.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ error: "Greška pri učitavanju reklama" });
  }
});

app.post("/api/ads", uploadLimiter, async (req, res) => {
  try {
    const { image, link } = req.body;

    const validation = validateAd({ image, link });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const ads = await readAds();
    const newAd = {
      id: Date.now(),
      image: image.trim(),
      link: link.trim(),
      createdAt: new Date().toISOString(),
    };

    ads.push(newAd);
    await writeAds(ads);

    console.log("✓ New ad created:", newAd.id);
    res.status(201).json(newAd);
  } catch (error) {
    console.error("Error creating ad:", error);
    res.status(500).json({ error: "Greška pri kreiranju reklame" });
  }
});

app.delete("/api/ads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Nevažeći ID" });
    }

    const ads = await readAds();
    const filteredAds = ads.filter((ad) => ad.id !== id);

    if (ads.length === filteredAds.length) {
      return res.status(404).json({ error: "Reklama nije pronađena" });
    }

    await writeAds(filteredAds);
    console.log("✓ Ad deleted:", id);
    res.json({ message: "Reklama obrisana" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({ error: "Greška pri brisanju" });
  }
});

// Chatbot endpoints
app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    const { message, history, pageContext } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (message.length > 500) {
      return res
        .status(400)
        .json({ error: "Message too long (max 500 characters)" });
    }

    const conversationHistory = Array.isArray(history)
      ? history.slice(-20).filter((h) => h.role && h.content)
      : [];

    // Always use bakery context
    const context = "bakery";
    const result = await chatbot.chat(message, conversationHistory, context);

    res.json({
      message: result.response,
      source: result.source,
      model: result.model,
      context: context,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(200).json({
      message:
        "For help contact:\n📧 hello@vesperahearth.rs\n📞 +381 11 123 4567",
      source: "fallback",
      model: "error-handler",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/api/chat/status", (req, res) => {
  res.json({
    enabled: chatbot.enabled,
    model: chatbot.model || "fallback",
    hasApiKey: !!chatbot.groq,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "Endpoint nije pronađen" });
  } else {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production" ? "Greška servera" : err.message,
  });
});

// Start server
async function start() {
  try {
    await initAdsFile();
    app.listen(PORT, () => {
      console.log("==========================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🤖 Chatbot: ${chatbot.enabled ? "Enabled" : "Fallback mode"}`
      );
      if (isVercel) console.log(`☁️  Running on Vercel`);
      console.log("==========================================");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();

// Export for Vercel
module.exports = app;
