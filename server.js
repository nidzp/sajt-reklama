require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADS_FILE = path.join(__dirname, "ads.json");

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit uploads
  message: { error: "Too many uploads, please try again later." },
});

app.use("/api/", limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

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

// Routes
app.get("/api/ads", async (req, res) => {
  try {
    const ads = await readAds();
    res.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
});

app.post("/api/ads", uploadLimiter, async (req, res) => {
  try {
    const { image, link } = req.body;

    // Validate
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
    res.status(500).json({ error: "Failed to create ad" });
  }
});

app.delete("/api/ads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ad ID" });
    }

    const ads = await readAds();
    const filteredAds = ads.filter((ad) => ad.id !== id);

    if (ads.length === filteredAds.length) {
      return res.status(404).json({ error: "Ad not found" });
    }

    await writeAds(filteredAds);
    console.log("✓ Ad deleted:", id);
    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({ error: "Failed to delete ad" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
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
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log("==========================================");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
