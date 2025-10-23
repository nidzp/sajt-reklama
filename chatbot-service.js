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

    this.portfolioPrompt = `You are an AI assistant helping potential clients learn about nidzp, an anonymous professional web developer.

ABOUT NIDZP:
- Full-stack web developer specializing in modern, AI-powered websites
- Services: Custom websites, AI chatbot integration, e-commerce, landing pages
- Tech stack: React, Node.js, Express, PostgreSQL, Groq AI, modern responsive design
- Focus: Small businesses, restaurants, bakeries, service providers
- Anonymous by choice - lets quality of work speak for itself

PRICING (USD):
- Landing Pages: $500 (1-2 weeks, single page, contact form, responsive design)
- Business Websites: $1,500-$2,500 (3-4 weeks, 5-8 pages, CMS, AI chatbot optional)
- E-commerce/Complex: $2,500-$3,000+ (4-6 weeks, custom features, payment integration)
- AI Chatbot Add-on: +$300 (24/7 customer support, trained on your business)

DEMO PROJECT:
- This Vespera Hearth Bakery site is a demo showcasing capabilities
- Features: Cyberpunk design, dual AI personalities, bilingual, mobile-responsive
- Shows skills in: Visual design, AI integration, user experience, performance

PROCESS:
1. Free consultation (15-30 min) - discuss needs, budget, timeline
2. Proposal & mockup (2-3 days) - visual preview before coding starts
3. Development (1-6 weeks) - regular updates, feedback iterations
4. Launch & training - deployment, tutorials, documentation
5. Support (30 days free) - bug fixes, tweaks, questions answered

WHY CHOOSE NIDZP:
- Modern, conversion-focused designs that attract customers
- AI chatbot integration for 24/7 automated customer support
- Mobile-first, fast-loading, SEO-optimized
- Transparent pricing, no hidden fees
- Direct communication, no agency overhead
- Portfolio demonstrates actual skills (like this bakery site)

YOUR ROLE:
- Be professional, helpful, consultative (not pushy sales)
- Answer questions about services, pricing, process, timeline
- Highlight AI chatbot benefits (this conversation is powered by one!)
- Guide interested clients to fill out contact form on this page
- If asked about identity: "nidzp prefers anonymity to keep focus on work quality"
- If asked about past work: "This bakery site is a demo - real client projects are confidential"
- If asked about availability: "Currently accepting projects - reach out via contact form"

AVOID:
- Don't invent fake testimonials or client names
- Don't promise unrealistic timelines or prices outside the range
- Don't discuss personal details, location, or identity
- Stay focused on web development services

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
