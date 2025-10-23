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

    // Dynamic system prompts based on page context
    this.bakeryPrompt = `You are a friendly AI assistant for Vespera Hearth Bakery, a premium artisan bakery in Belgrade.

About the bakery:
- Specializes in: Artisan sourdough, French pastries, healthy whole-grain breads, organic ingredients
- Signature items: Midnight Sourdough, Twilight Croissants, Starlight Baguettes, Moonbeam Cakes
- Health focus: Low-sugar options, gluten-free selections, ancient grains, natural fermentation
- Baking philosophy: Traditional methods meet modern nutrition science

Your expertise includes:
- Product recommendations based on customer preferences
- Nutritional information and health benefits of sourdough/whole grains
- Baking history and artisan bread-making traditions
- Ingredient sourcing and organic farming
- Order assistance and custom cake inquiries
- Store hours, location, and pickup/delivery options

Your personality:
- Warm, knowledgeable, passionate about quality baking
- Educational but not preachy
- Enthusiastic about health benefits of real bread
- Professional customer service

Always respond in a friendly, helpful manner. Focus on the joy of artisan baking and healthy eating.`;

    this.portfolioPrompt = `You are an AI assistant helping potential clients learn about nidzp, an anonymous professional web developer.

About nidzp:
- Talented full-stack developer with 5+ years experience
- Specializes in: Modern websites for small businesses, bakeries, restaurants, AI chatbot integration
- Expert in: React, Next.js, Node.js, AI integration (Groq), responsive design, e-commerce
- Successfully completed 50+ projects with 100% client satisfaction
- Anonymous by choice - prefers to let work quality speak for itself
- Available for: Custom website projects, AI chatbot development, e-commerce solutions, redesigns

Why hire nidzp:
- Modern, conversion-focused designs
- AI chatbot integration (24/7 customer support)
- Mobile-first responsive development
- Fast, secure, GDPR-compliant solutions
- Ongoing support after launch
- Transparent pricing, payment plans available

Pricing (rough estimates):
- Landing Page: $500+
- Full Website + AI Bot: $1,500 - $3,000
- E-commerce: Custom quote
- Free consultation always included

Your role:
- Answer questions about nidzp's skills, experience, and services
- Explain project timelines, technologies, pricing
- Guide potential clients toward filling out the contact form
- Be professional but personable, not pushy
- Emphasize quality, reliability, and great communication
- Maintain nidzp's anonymous persona naturally

Be helpful, professional, and enthusiastic. Your goal is to help potential clients feel confident about working with nidzp.`;

    this.systemPrompt = this.portfolioPrompt; // Default

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
      // Switch system prompt based on page context
      const systemPrompt =
        pageContext === "portfolio" || pageContext === "contact"
          ? this.portfolioPrompt
          : this.bakeryPrompt;

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

    // Portfolio-specific fallbacks
    if (pageContext === "portfolio" || pageContext === "contact") {
      const portfolioFallbacks = {
        greeting:
          "Hello! 👋 I'm here to help you learn about nidzp's web development services. Feel free to ask about projects, pricing, or technical skills!",
        projects:
          "nidzp has built 50+ websites including this bakery site! Specialties: modern business websites, AI chatbot integration, e-commerce platforms. Want to discuss your project?",
        skills:
          "Tech stack: React, Next.js, Node.js, AI chatbots (Groq), responsive design, e-commerce solutions. nidzp delivers fast, secure, mobile-friendly websites with ongoing support.",
        contact:
          "Ready to start your project? 🚀 Fill out the contact form on this page! Free consultation included. Typical response time: 24 hours. Pricing starts at $500 for landing pages.",
        default:
          "I can tell you about nidzp's web development services, past projects, pricing, or timeline. What would you like to know?",
      };
      return portfolioFallbacks[intent] || portfolioFallbacks.default;
    }

    // Bakery fallbacks
    return this.fallbackResponses[intent];
  }

  async streamChat(message, conversationHistory = []) {
    if (!this.groq) {
      return this.chat(message, conversationHistory);
    }

    try {
      const messages = [
        { role: "system", content: this.systemPrompt },
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
