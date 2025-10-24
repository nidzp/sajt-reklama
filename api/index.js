// Vercel serverless Express app
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const ADS_FILE = path.join(__dirname, "..", "ads.json");

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

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
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
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Previše upload-a. Pokušajte ponovo za 1 sat." },
});

app.use("/api/", limiter);
app.use(express.json({ limit: "10mb" }));

// Initialize ads.json if it doesn't exist
async function initAdsFile() {
  try {
    await fs.access(ADS_FILE);
  } catch {
    await fs.writeFile(ADS_FILE, JSON.stringify([], null, 2));
  }
}

// Read ads from file
async function readAds() {
  try {
    const data = await fs.readFile(ADS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write ads to file
async function writeAds(ads) {
  try {
    await fs.writeFile(ADS_FILE, JSON.stringify(ads, null, 2));
  } catch (error) {
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
    version: "1.0.0",
  });
});

// Ads endpoints
app.get("/api/ads", async (req, res) => {
  try {
    const ads = await readAds();
    res.json(ads);
  } catch (error) {
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

    res.status(201).json(newAd);
  } catch (error) {
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
    res.json({ message: "Reklama obrisana" });
  } catch (error) {
    res.status(500).json({ error: "Greška pri brisanju" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint nije pronađen" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Greška servera" : err.message,
  });
});

// Initialize and export for Vercel
initAdsFile();

module.exports = app;
