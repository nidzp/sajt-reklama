// Vercel Serverless Function for chatbot API
const Groq = require("groq-sdk");

// Initialize Groq client
let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history, pageContext } = req.body;

    // Validate message
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (message.length > 500) {
      return res
        .status(400)
        .json({ error: "Message too long (max 500 characters)" });
    }

    // Validate history
    const conversationHistory = Array.isArray(history)
      ? history.slice(-20).filter((h) => h.role && h.content)
      : [];

    // Always use bakery context
    const context = "bakery";

    // Single system prompt for bakery only
    const systemPrompt = "You are a friendly AI assistant for Vespera Hearth Bakery. Provide helpful information about artisan breads, sourdough health benefits, and baking traditions. This is a demo site showcasing web development skills.";

    // Try Groq AI
    if (groq) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: message }
          ],
          model: "llama3-8b-8192",
          temperature: 0.7,
          max_tokens: 500,
        });

        return res.status(200).json({
          message: completion.choices[0]?.message?.content || "No response",
          source: "ai",
          model: "llama3-8b-8192",
          context: context,
          timestamp: new Date().toISOString(),
        });
      } catch (aiError) {
        console.error("Groq AI error:", aiError);
      }
    }

    // Fallback response for bakery
    const fallbackMsg = "Welcome to Vespera Hearth Bakery! 🥖 I can help you with our menu, sourdough health benefits, baking traditions, or orders. What would you like to know?";

    res.status(200).json({
      message: fallbackMsg,
      source: "fallback",
      model: "none",
      context: context,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      message:
        "I'm experiencing technical difficulties. Please try again or contact via email: nikola.djokic10@gmail.com",
      source: "error",
      model: "fallback",
      timestamp: new Date().toISOString(),
    });
  }
};
