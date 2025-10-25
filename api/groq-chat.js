// Groq AI Chatbot API - Vercel Serverless Function
import OpenAI from "openai";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Initialize Groq client using OpenAI SDK
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // System prompt for chatbot personality
    const systemPrompt = `You are an AI assistant for NIDZP Studio - a premium digital creative studio.

Your role:
- Help visitors understand our services (UI/UX Design, Frontend Development, Motion Design, Branding)
- Answer questions about web development, design, and digital strategy
- Be professional, friendly, and concise
- If asked about pricing, suggest contacting us directly via the contact form
- If asked about portfolio, mention our portfolio page with 6+ featured projects
- Keep responses under 150 words unless detailed explanation is requested

Our expertise:
- Apple-inspired typography and minimalist design
- Rockstar Games-level cinematic animations
- Performance-first development (60fps, lazy loading, sub-second load times)
- Vanilla JavaScript (no bloated frameworks)
- Mobile-first responsive design
- Brand strategy and identity

Respond naturally and helpfully. Use emojis sparingly (max 1-2 per response).`;

    // Build messages array
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message },
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      stream: false,
    });

    const aiResponse =
      completion.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response. Please try again.";

    // Return response with metadata
    res.status(200).json({
      success: true,
      response: aiResponse,
      model: "llama-3.1-8b-instant",
      timestamp: new Date().toISOString(),
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("Groq API Error:", error);

    // Handle rate limiting
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please try again in a moment.",
      });
    }

    // Handle authentication errors
    if (error.status === 401) {
      return res.status(500).json({
        success: false,
        error: "API authentication failed. Please contact support.",
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred.",
    });
  }
}
