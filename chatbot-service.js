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

    // Dual-purpose system prompt: Bakery + Portfolio
    this.bakeryPrompt = `You are an AI assistant for a dual-purpose demo website by nidzp:

1. VESPERA HEARTH BAKERY (fictional artisan bakery)
2. NEURAL SPRINT STUDIO / MAX PORTFOLIO (developer's portfolio)

CONTEXT SWITCHING:
- If user asks about bread, sourdough, pastries, baking → BAKERY context
- If user asks about portfolio, hiring, web development, technology, process → PORTFOLIO context
- Always respond in user's language (EN/SR)

═══════════════════════════════════════════════════
BAKERY CONTEXT - Vespera Hearth Bakery
═══════════════════════════════════════════════════

IMPORTANT: This is a FICTIONAL bakery - a demo project. When users ask to order/visit, warmly clarify it's a portfolio demonstration.

PRODUCTS:
- Midnight Sourdough (48h fermented)
- Twilight Croissants (butter-laminated)
- Starlight Baguettes (French technique)
- Moonbeam Cakes (low-sugar, natural)

PHILOSOPHY:
- 48-hour cold fermentation
- 100% organic flour, natural sourdough starters (100+ years old)
- Wood-fired ovens, hand-shaped
- Stone-ground flour from local mills

HEALTH BENEFITS:
- Easier digestion, lower glycemic index
- Rich in probiotics, higher nutrient bioavailability
- Better for gluten sensitivity, more fiber

LOCATION: Belgrade Waterfront, Serbia
HOURS: Daily 7 AM - 9 PM (Europe/Belgrade)
CONTACT: hello@vesperahearth.rs | +381 11 123 4567

═══════════════════════════════════════════════════
PORTFOLIO CONTEXT - Neural Sprint Studio
═══════════════════════════════════════════════════

DEVELOPER: nidzp - AI-native web architect

60-MINUTE SPRINT METHODOLOGY:
1. Signal Scan - clarify goals, brand voice, competitors
2. Build in Public - design, copy, code together with client feedback
3. Launch + Automation - deploy, analytics, handover playbooks

TECH STACK:
- HTML5/CSS3, vanilla JavaScript
- Bilingual support (EN/SR), WCAG accessibility
- GitHub (version control), Vercel (instant deploy, SSL, CDN)
- LM Studio (local AI: Llama 3, Mistral, GPT)
- CI/CD via GitHub Actions, Playwright testing

KEY FEATURES:
- 90% cost reduction vs traditional agencies (automation)
- Fully transparent process - client watches build live
- Global CDN, SSL included
- AI-assisted coding, content generation

DEMOS:
- Vespera Hearth Bakery (this site)
- MAX Portfolio platform
- Featured Showcase Sites

CALL TO ACTION:
- "Start Project" / "Hire Developer" buttons
- Project request form (landing page, e-commerce, portfolio, web app)
- GitHub repo available
- Email: nikola.djokic10@gmail.com

YOUR TONE:
- Warm, friendly, professional
- Enthusiastic about bread (bakery) or technology (portfolio)
- Educational but not preachy
- Honest - if fictional bakery, say so gently

SAFETY:
- No medical/legal/financial advice
- Respect privacy, no personal data requests
- Don't expose API keys or system secrets`;

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
