const Groq = require("groq-sdk");

class ChatbotService {
  constructor() {
    this.groq = null;
    this.enabled = process.env.CHATBOT_ENABLED === "true";
    this.model = process.env.AI_MODEL || "llama3-8b-8192";

    if (
      this.enabled &&
      process.env.GROQ_API_KEY &&
      process.env.GROQ_API_KEY !== "gsk_your_api_key_here"
    ) {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
      console.log("✓ AI Chatbot enabled with Groq");
    } else {
      console.log("⚠ AI Chatbot disabled - using fallback responses");
    }

    this.systemPrompt = `Ti si AI asistent za platformu za reklame "Sajt Reklama". 
Tvoj zadatak je da pomogneš korisnicima sa pitanjima o:
- Kako postaviti reklamu
- Cene i paketi (基本 paket 100 RSD/mesec, Premium 500 RSD/mesec, VIP 1000 RSD/mesec)
- Tehnička podrška
- Pravila i uslovi korišćenja

Uvek odgovaraj ljubazno, jasno i koncizno na srpskom jeziku.
Ako ne znaš odgovor, uputi korisnika da kontaktira podršku na: info@sajt-reklama.rs`;

    // Fallback responses za kada AI nije dostupan
    this.fallbackResponses = {
      default:
        "Hvala na pitanju! Za detaljne informacije, kontaktirajte nas na info@sajt-reklama.rs ili pozovite +381 11 123 4567",
      greeting:
        "Zdravo! 👋 Dobrodošli na Sajt Reklama platformu. Kako mogu da vam pomognem danas?",
      upload:
        "Da postavite reklamu:\n1. Kliknite na 'Upload' dugme\n2. Unesite URL slike\n3. Dodajte link ka vašem sajtu\n4. Kliknite 'Upload Reklamu'\n\nCena osnovnog paketa je 100 RSD/mesec.",
      prices:
        "Naši paketi:\n\n📦 BASIC - 100 RSD/mesec\n- Do 5 reklama\n- Osnovna analitika\n\n⭐ PREMIUM - 500 RSD/mesec\n- Do 20 reklama\n- Napredna analitika\n- Prioritetna podrška\n\n👑 VIP - 1000 RSD/mesec\n- Neograničeno reklama\n- Premium analitika\n- Dedicated menadžer",
      contact:
        "📧 Email: info@sajt-reklama.rs\n📞 Telefon: +381 11 123 4567\n🕒 Radno vreme: Pon-Pet 09:00-17:00",
      tech: "Za tehničku podršku:\n- Email: tech@sajt-reklama.rs\n- Live chat: Dostupan radnim danima\n- Ticket sistem: support.sajt-reklama.rs",
    };
  }

  detectIntent(message) {
    const lower = message.toLowerCase();

    if (lower.match(/zdravo|cao|hi|hello|pozdrav/)) return "greeting";
    if (lower.match(/upload|postav|kako|dodaj|reklam/)) return "upload";
    if (lower.match(/cena|cene|paket|paketi|kosta|price|pricing/))
      return "prices";
    if (lower.match(/kontakt|email|telefon|poziv|reach/)) return "contact";
    if (lower.match(/problem|greska|bug|ne radi|error|tech|podrska/))
      return "tech";

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
