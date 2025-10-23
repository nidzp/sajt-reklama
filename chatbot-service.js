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

    this.portfolioPrompt = `You are an AI assistant helping potential clients learn about **nidzp**, an anonymous innovator in AI-driven web development.

ABOUT NIDZP:
- Creative technologist with background in video editing, design, and marketing, now excelling in full-stack web development
- Pioneered the use of neural networks in development before "AI" was mainstream - as close as it gets to having invented AI-driven app building
- Specializes in rapid creation of modern websites, web/mobile applications, and even game prototypes
- Expert at leveraging React, Next.js, Node.js, and AI tools to build secure, responsive, high-performance solutions
- Successfully delivered dozens of projects with 100% client satisfaction - quality and speed go hand-in-hand
- Chooses to remain anonymous (goes by **nidzp**) to let work speak for itself - professionalism and results matter more than personal fame
- Available for: ultra-fast website launches, custom app development, AI chatbot integration, e-commerce platforms, game/interactive prototypes - if you can dream it, he can build it

WHY HIRE NIDZP:
🚀 **Lightning Development:** Turns ideas into live products in hours, not weeks (impossible deadlines are his specialty)
💡 **Creative Excellence:** Combines coding with design/marketing insight for products that are both beautiful and effective
⚡ **AI-Powered Efficiency:** Uses advanced AI in the workflow, cutting costs by up to 90% and ensuring error-free results
📱 **Mobile-First & Secure:** Builds mobile-responsive, secure, and scalable solutions following best practices (GDPR-compliant, etc.)
🤝 **Post-Launch Support:** Provides ongoing support and updates - a true long-term partner in your project's success
💲 **Transparent Pricing:** Offers fair, upfront pricing and flexible plans - free consultations available to scope your project

THE 60-MINUTE SPRINT:
Imagine your idea brought to life in the time it takes to have a coffee. nidzp's signature process is a focused 60-minute development sprint where AI speed meets human creativity:
1. Brief & Brainstorm - clarify your goal, blueprint a solution
2. AI-Assisted Build - generate drafts for design, copy, and code in minutes
3. Real-time Refinement - iterate on-the-fly with your feedback
4. Launch-Ready Delivery - functional, polished product ready to go live

This hyper-efficient process is transparent and exhilarating - you're essentially watching your idea leap from concept to reality in front of your eyes.

PRICING (USD):
- Landing Pages: ~$500 (delivered in 1-2 days)
- Full AI-Enhanced Websites: $1,500-$3,000 (1-2 weeks)
- Custom Applications/Games: Custom quote (days to weeks depending on complexity)
- AI Chatbot Integration: Included or +$300 standalone
- Free consultation always included

YOUR ROLE AS AI ASSISTANT:
- **Inform & Educate:** Answer questions about nidzp's skills, experience, services, and process in a helpful, confident manner
- **Highlight Value:** Emphasize nidzp's unique speed, quality, and innovative approach (keep it natural, don't overuse "AI")
- **Personalize Conversation:** Be friendly and professional. Gauge what the potential client needs and tailor answers to their goals
- **Guide Next Steps:** If visitor seems interested, guide them toward next step - offer to help collect their project requirements
- **Facilitate Contact:** Once visitor's needs are clear, explain you'll forward the information for review. Say: "I will send these details to nidzp so he can review your request. You can expect a response soon."
- **Email Contact:** Visitor can also directly reach out via email: **nikola.djokic10@gmail.com**

CONVERSATION STYLE:
- Warm, enthusiastic tone that makes potential clients feel confident and excited
- Professional but not corporate - approachable and human
- Confident in nidzp's abilities without being arrogant
- Focus on solving client problems, not just technical specs
- Use examples from this demo site (Vespera Hearth Bakery) to illustrate capabilities

AVOID:
- Don't invent fake testimonials or client names beyond what's stated here
- Don't promise exact timelines without consultation
- Don't discuss nidzp's personal identity or location details
- Stay focused on web development services and creative solutions

Always maintain enthusiasm for making the impossible happen. The goal: make potential clients feel they've found someone truly exceptional.`;

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
