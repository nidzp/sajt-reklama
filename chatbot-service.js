const Groq = require("groq-sdk");

// Dual AI Bot System: Bakery bot (product info) + Portfolio bot (hire nidzp)
class ChatbotService {
  constructor() {
    this.groq = null;
    this.enabled = process.env.CHATBOT_ENABLED === "true";
    this.model = process.env.AI_MODEL || "llama3-8b-8192";

    // Try to initialize Groq
    if (
      this.enabled &&
      process.env.GROQ_API_KEY &&
      process.env.GROQ_API_KEY !== "gsk_your_api_key_here" &&
      process.env.GROQ_API_KEY.startsWith("gsk_")
    ) {
      try {
        const Groq = require("groq-sdk");
        this.groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });
        console.log("✓ AI Chatbot enabled with Groq (" + this.model + ")");
      } catch (error) {
        console.error("⚠ Failed to initialize Groq:", error.message);
        this.enabled = false;
      }
    } else {
      console.log("⚠ AI Chatbot disabled - using fallback responses");
      console.log(
        "  Reason:",
        !this.enabled
          ? "Disabled in config"
          : !process.env.GROQ_API_KEY
          ? "No API key"
          : "Invalid API key format"
      );
    }

    // Single system prompt - only for bakery
    this.bakeryPrompt = `You are a friendly AI assistant for Vespera Hearth Bakery, an artisan bakery in Belgrade, Serbia.

ABOUT VESPERA HEARTH BAKERY:
- Specialty: Artisan sourdough, French pastries, whole-grain breads
- Signature Products: Midnight Sourdough (48h fermented), Twilight Croissants, Starlight Baguettes, Moonbeam Cakes
- Philosophy: Traditional baking methods + modern nutrition science
- Ingredients: 100% organic flour, natural yeast starters, locally sourced butter, no preservatives

HEALTH BENEFITS (sourdough focus):
- Easier digestion: Lactic acid breaks down gluten, gentle on stomach
- Lower glycemic index: Won't spike blood sugar like commercial bread
- Rich in probiotics: Natural fermentation supports gut health
- Higher nutrient bioavailability: Fermentation unlocks vitamins & minerals
- Better for gluten sensitivity: Long fermentation reduces gluten proteins
- More fiber: Whole grain options support healthy digestion

BAKING TRADITIONS:
- 48-hour cold fermentation for maximum flavor & health benefits
- Stone-ground organic flour from local mills
- Wood-fired ovens for authentic crust & texture
- No commercial yeast - only natural sourdough starters (some 100+ years old)
- Hand-shaped, never mass-produced

CUSTOMER SERVICE:
- Recommend products based on preferences (sweet/savory, dietary needs)
- Explain health benefits of sourdough vs commercial bread
- Share baking history and artisan traditions
- Answer questions about ingredients, allergens, nutrition
- Help with custom orders (birthday cakes, catering, special diets)
- Provide store hours, location (Belgrade Waterfront), delivery info

YOUR PERSONALITY:
- Warm, knowledgeable, passionate about real bread
- Educational without being preachy
- Enthusiastic about health benefits of traditional baking
- Professional, helpful customer service

NOTE: This bakery is fictional - a demo project showcasing web development skills. Be authentic to the bakery concept, but if customers ask how to actually order, gently clarify it's a demo site.`;

    // Fallback responses when AI is not available
    this.fallbackResponses = {
      default:
        "Welcome to Vespera Hearth Bakery! 🥖 I can help you with our menu, baking methods, health benefits of sourdough, or place an order. What would you like to know?",
      greeting:
        "Hello! 👋 Welcome to Vespera Hearth Bakery. We craft artisan breads and pastries using traditional methods and organic ingredients. How can I help you today?",
      projects:
        "Our specialty breads include:\n\n🌙 Midnight Sourdough - 48-hour fermented, gut-friendly\n🥐 Twilight Croissants - Butter-laminated perfection\n� Starlight Baguettes - Classic French technique\n🍰 Moonbeam Cakes - Low-sugar, naturally sweetened\n\nAll made with organic flour and natural ingredients!",
      skills:
        "Our baking expertise:\n\n🍞 Artisan Sourdough - Natural fermentation\n🌾 Whole Grain Breads - Ancient grains, high fiber\n� French Pastries - Traditional techniques\n🌱 Gluten-Free Options - Dedicated prep area\n💚 Health-Focused - Low-sugar, organic ingredients\n\nWe combine tradition with modern nutrition science!",
      contact:
        "Visit us or order online! 🏪\n\n� Belgrade Waterfront\n⏰ Daily 7 AM - 9 PM\n� +381 11 123 4567\n� hello@vesperahearth.rs\n\nWe offer pickup and delivery. Place your order through our website!",
    };
  }

  detectIntent(message) {
    const lowerMsg = message.toLowerCase();

    if (
      lowerMsg.includes("hello") ||
      lowerMsg.includes("hi") ||
      lowerMsg.includes("hey") ||
      lowerMsg.includes("zdravo")
    ) {
      return "greeting";
    }

    if (
      lowerMsg.includes("project") ||
      lowerMsg.includes("work") ||
      lowerMsg.includes("portfolio") ||
      lowerMsg.includes("built") ||
      lowerMsg.includes("created")
    ) {
      return "projects";
    }

    if (
      lowerMsg.includes("skill") ||
      lowerMsg.includes("technology") ||
      lowerMsg.includes("tech stack") ||
      lowerMsg.includes("experience") ||
      lowerMsg.includes("know")
    ) {
      return "skills";
    }

    if (
      lowerMsg.includes("contact") ||
      lowerMsg.includes("email") ||
      lowerMsg.includes("reach") ||
      lowerMsg.includes("hire") ||
      lowerMsg.includes("available")
    ) {
      return "contact";
    }

    return "default";
  }

  async chat(message, conversationHistory = [], pageContext = "bakery") {
    try {
      // Always use bakery prompt
      const systemPrompt = this.bakeryPrompt;

      // Pokušaj sa AI modelom
      if (this.groq) {
        const messages = [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: message },
        ];

        const completion = await this.groq.chat.completions.create({
          messages: messages,
          model: this.model,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
          stream: false,
        });

        return {
          response:
            completion.choices[0]?.message?.content ||
            this.getFallbackResponse(message, pageContext),
          source: "ai",
          model: this.model,
        };
      }
    } catch (error) {
      console.error("AI Error:", error.message);
    }

    // Fallback na statične odgovore
    return {
      response: this.getFallbackResponse(message, pageContext),
      source: "fallback",
      model: "rule-based",
    };
  }

  getFallbackResponse(message, pageContext = "bakery") {
    const intent = this.detectIntent(message);
    // Always use bakery fallbacks
    return this.fallbackResponses[intent] || this.fallbackResponses.default;
  }

  async streamChat(message, conversationHistory = []) {
    if (!this.groq) {
      return this.chat(message, conversationHistory);
    }

    try {
      const messages = [
        { role: "system", content: this.bakeryPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ];

      const stream = await this.groq.chat.completions.create({
        messages: messages,
        model: this.model,
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      });

      return stream;
    } catch (error) {
      console.error("AI Stream Error:", error.message);
      return this.chat(message, conversationHistory);
    }
  }
}

module.exports = new ChatbotService();
