const Groq = require("groq-sdk");

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

    this.systemPrompt = `You are an AI assistant for a professional web developer's portfolio website.

About the developer:
- 5+ years of web development experience
- Specializes in: React, Next.js, Node.js, AI integration, responsive design
- Completed 50+ successful projects
- Expert in full-stack development, UI/UX design, and modern web technologies
- Available for: freelance projects, consulting, full-time opportunities

Featured projects:
1. E-Commerce Platform - Full-stack solution with AI recommendations (React, Node.js, MongoDB, AI/ML)
2. Analytics Dashboard - Real-time data visualization with AI insights (Vue.js, D3.js, Python)
3. AI Chatbot System - NLP-powered customer support (Groq AI, Express, WebSocket)
4. Fintech Dashboard - Stock tracking and portfolio management (Next.js, TypeScript, GraphQL)
5. SaaS Management Platform - Project management with team collaboration (React, PostgreSQL, Docker)
6. Smart Home IoT Hub - AI automation for smart devices (Node.js, MQTT, TensorFlow, AWS IoT)

Your role:
- Answer questions about the developer's skills, experience, and projects
- Help potential clients understand what services are offered
- Explain technical details about projects and technologies used
- Be professional, friendly, and enthusiastic about web development
- Encourage visitors to get in touch for collaborations

Always respond in English, be concise but informative, and showcase the developer's expertise.`;

    // Fallback responses when AI is not available
    this.fallbackResponses = {
      default:
        "Thanks for your interest! I'm a web developer with 5+ years of experience in React, Node.js, and AI integration. Feel free to explore my projects or use the contact form to get in touch!",
      greeting:
        "Hello! 👋 Welcome to my portfolio. I'm a full-stack web developer specializing in modern JavaScript frameworks and AI integration. How can I help you today?",
      projects:
        "I've completed 50+ projects including:\n\n🛒 E-Commerce Platform - AI-powered recommendations\n📊 Analytics Dashboard - Real-time data visualization\n🤖 AI Chatbot - NLP customer support\n💰 Fintech Dashboard - Stock tracking\n📱 SaaS Platform - Team collaboration\n🏠 IoT Hub - Smart home automation\n\nWould you like to know more about any specific project?",
      skills:
        "My technical skills:\n\n⚛️ Frontend: React, Next.js, Vue.js, TypeScript\n🟢 Backend: Node.js, Express, Python\n🤖 AI/ML: Groq, TensorFlow, NLP\n🗄️ Databases: MongoDB, PostgreSQL, Redis\n☁️ DevOps: Docker, AWS, Vercel\n🎨 Design: UI/UX, Responsive Design\n\nI'm always learning new technologies!",
      contact:
        "I'd love to hear about your project! 🚀\n\nYou can:\n📧 Use the contact form on this page\n💼 Connect on LinkedIn\n🐙 Check my GitHub\n\nI typically respond within 24 hours!",
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

  async chat(message, conversationHistory = []) {
    try {
      // Pokušaj sa AI modelom
      if (this.groq) {
        const messages = [
          { role: "system", content: this.systemPrompt },
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
            this.getFallbackResponse(message),
          source: "ai",
          model: this.model,
        };
      }
    } catch (error) {
      console.error("AI Error:", error.message);
    }

    // Fallback na statične odgovore
    return {
      response: this.getFallbackResponse(message),
      source: "fallback",
      model: "rule-based",
    };
  }

  getFallbackResponse(message) {
    const intent = this.detectIntent(message);
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
