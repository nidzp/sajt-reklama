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

    // Get page context (defaults to 'bakery')
    const context = pageContext || "bakery";

    // System prompts based on context
    const bakeryPrompt = "You are a friendly AI assistant for Vespera Hearth Bakery. Provide helpful information about artisan breads, sourdough health benefits, and baking traditions.";
    const portfolioPrompt = "You are an AI assistant helping clients learn about nidzp, an AI web architect. Emphasize lightning speed (60-min sprint), creative excellence, AI-powered workflow, and transparent pricing ($500-$3000). Contact: nikola.djokic10@gmail.com";
    
    const systemPrompt = context === "portfolio" ? portfolioPrompt : bakeryPrompt;

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

    // Fallback response
    const fallbackMsg = context === "portfolio" 
      ? "Hi! I'm experiencing technical difficulties. Please contact nidzp directly at nikola.djokic10@gmail.com or use the contact form above. Services include websites ($500+), apps ($1500-$3000), and AI integration. The 60-minute sprint process delivers results fast!"
      : "Welcome to Vespera Hearth Bakery! 🥖 For menu info, health benefits of sourdough, or orders, please use our contact form. This is a demo site showcasing web development capabilities.";

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
