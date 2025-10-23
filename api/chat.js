// Vercel Serverless Function for chatbot API
const ChatbotService = require("../chatbot-service.js");

// Initialize chatbot service
const chatbot = new ChatbotService();

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

    // Get chatbot response
    const result = await chatbot.chat(message, conversationHistory, context);

    // Return response
    res.status(200).json({
      message: result.response,
      source: result.source,
      model: result.model,
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
