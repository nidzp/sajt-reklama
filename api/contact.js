// Contact Form API - Vercel Serverless Function with Full Validation & Concurrency Control
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

// ==================== PATCH 5: CONCURRENCY CONTROL ====================
// Semaphore implementation to limit concurrent Groq API calls
class Semaphore {
  constructor(max) {
    this.max = max; // Maximum concurrent operations (3 for Groq rate limits)
    this.current = 0; // Current number of running operations
    this.queue = []; // FIFO queue of pending requests
  }

  async acquire() {
    // If under limit, proceed immediately
    if (this.current < this.max) {
      this.current++;
      return;
    }

    // Otherwise, wait in queue
    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  release() {
    this.current--;
    // Process next in queue (FIFO)
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this.current++;
      next();
    }
  }
}

// Global semaphore: max 3 concurrent Groq API calls
const groqSemaphore = new Semaphore(3);

// ==================== PATCH 1: INPUT VALIDATION ====================
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactInput(data) {
  const { name, email, message } = data;

  // Validate name
  if (!name || typeof name !== "string" || !name.trim()) {
    return {
      valid: false,
      error: "Name is required and must be a non-empty string",
    };
  }

  // Validate email
  if (!email || typeof email !== "string" || !email.trim()) {
    return {
      valid: false,
      error: "Email is required and must be a non-empty string",
    };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return {
      valid: false,
      error: "Email must be a valid email address (e.g., user@example.com)",
    };
  }

  // Validate message
  if (!message || typeof message !== "string" || !message.trim()) {
    return {
      valid: false,
      error: "Message is required and must be a non-empty string",
    };
  }

  return { valid: true };
}

// ==================== PATCH 2: LOG REQUESTS TO FILE ====================
async function logContactRequest(name, email, message) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    };

    const logLine = JSON.stringify(logEntry) + "\n";

    // Use /tmp directory for Vercel serverless (writable)
    // In local development, this will write to project root
    const logPath = process.env.VERCEL
      ? "/tmp/contact.log"
      : path.join(process.cwd(), "contact.log");

    await fs.appendFile(logPath, logLine, "utf-8");
  } catch (error) {
    // Logging errors should not crash the server
    console.error("Error writing to contact.log:", error.message);
    // Continue processing the request even if logging fails
  }
}

// ==================== PATCH 3: ASYNC/AWAIT WITH ERROR HANDLING ====================
async function analyzeContactMessage(name, email, message) {
  // Acquire semaphore slot (wait if 3 requests are already running)
  await groqSemaphore.acquire();

  try {
    // Initialize Groq client
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // System prompt for contact analysis
    const systemPrompt = `You are an AI assistant analyzing contact form submissions for NIDZP Studio.

Your task:
1. Summarize the message in 1-2 sentences (max 140 characters)
2. Identify the intent: "hire", "collaboration", "question", "spam", or "other"
3. Assess urgency: "high", "medium", or "low"
4. Suggest a professional reply template

Respond in JSON format:
{
  "summary": "Brief summary here",
  "intent": "hire|collaboration|question|spam|other",
  "urgency": "high|medium|low",
  "suggested_reply": "Professional reply template addressing the sender by name"
}

Be concise, professional, and helpful.`;

    const userPrompt = `Analyze this contact submission:
Name: ${name}
Email: ${email}
Message: ${message}

Provide analysis in JSON format as specified.`;

    // Call Groq API with timeout protection
    const completion = await groq.chat.completions.create({
      model: process.env.AI_MODEL || "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("Empty response from Groq API");
    }

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (parseError) {
      throw new Error(
        `Failed to parse AI response as JSON: ${parseError.message}`
      );
    }

    // Validate analysis structure
    if (!analysis.summary || !analysis.intent || !analysis.urgency) {
      throw new Error("Incomplete analysis from AI (missing required fields)");
    }

    return {
      ok: true,
      analysis: {
        ...analysis,
        name,
        email,
        timestamp: new Date().toISOString(),
        model: process.env.AI_MODEL || "llama-3.1-8b-instant",
      },
    };
  } catch (error) {
    // Handle network errors, JSON parse errors, API errors
    console.error("Contact analysis error:", error);
    throw error; // Re-throw to be caught by handler
  } finally {
    // Always release semaphore slot
    groqSemaphore.release();
  }
}

// ==================== MAIN HANDLER ====================
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const { name, email, message } = req.body;

    // PATCH 2: Log every request (before validation)
    await logContactRequest(
      name || "(empty)",
      email || "(empty)",
      message || "(empty)"
    );

    // PATCH 1: Validate input
    const validation = validateContactInput({ name, email, message });
    if (!validation.valid) {
      return res.status(400).json({
        ok: false,
        error: validation.error,
      });
    }

    // PATCH 3 & 5: Analyze with async/await and concurrency control
    const result = await analyzeContactMessage(
      name.trim(),
      email.trim(),
      message.trim()
    );

    // Success response
    return res.status(200).json(result);
  } catch (error) {
    // PATCH 3: Comprehensive error handling
    console.error("Contact API Error:", error);

    // Handle rate limiting (429)
    if (error.status === 429) {
      return res.status(429).json({
        ok: false,
        error: "Too many requests. Please try again in a moment.",
      });
    }

    // Handle authentication errors (401)
    if (error.status === 401) {
      return res.status(500).json({
        ok: false,
        error: "API authentication failed. Please contact support.",
      });
    }

    // Generic error response
    return res.status(500).json({
      ok: false,
      error:
        error.message ||
        "An unexpected error occurred while processing your request.",
    });
  }
}

// ==================== PATCH 4: HEALTH CHECK ====================
// Note: Health check is implemented in a separate file: /api/health.js
// This keeps concerns separated and follows Vercel serverless best practices.
