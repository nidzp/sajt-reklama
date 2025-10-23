class Chatbot {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    // Fixed API URL for Vercel deployment
    this.API_URL = "/api";
    this.isTyping = false;

    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.checkStatus();
  }

  async checkStatus() {
    try {
      const response = await fetch(`${this.API_URL}/chat/status`);
      if (!response.ok) {
        console.log("Chatbot API not available, using fallback mode");
        return;
      }
      const data = await response.json();
      console.log("✓ Chatbot status:", data);

      // Update UI based on status
      if (!data.enabled || !data.hasApiKey) {
        document.querySelector(".chatbot-status").textContent = "Fallback Mode";
      }
    } catch (error) {
      console.log("Chatbot running in fallback mode");
    }
  }

  createWidget() {
    const widget = document.createElement("div");
    widget.id = "chatbot-widget";
    widget.innerHTML = `
      <!-- Chat Button -->
      <button id="chatbot-button" class="chatbot-button" aria-label="Open chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="chatbot-badge" id="chatbot-badge">💬</span>
      </button>

      <!-- Chat Window -->
      <div id="chatbot-window" class="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <h3>Portfolio AI Assistant 🤖</h3>
            <span class="chatbot-status">Online</span>
          </div>
          <button id="chatbot-close" class="chatbot-close" aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div id="chatbot-messages" class="chatbot-messages">
          <div class="chatbot-message bot">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <p>Hello! 👋 Welcome to my portfolio.</p>
              <p>I'm an AI assistant here to answer your questions about my work, skills, and experience. How can I help you today?</p>
              <div class="quick-actions">
                <button class="quick-action" data-message="Tell me about your projects">� Projects</button>
                <button class="quick-action" data-message="What are your skills?">� Skills</button>
                <button class="quick-action" data-message="How can I contact you?">� Contact</button>
              </div>
            </div>
          </div>
        </div>

        <div id="chatbot-typing" class="chatbot-typing" style="display: none;">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="typing-text">AI piše...</span>
        </div>

        <form id="chatbot-form" class="chatbot-form">
          <input 
            type="text" 
            id="chatbot-input" 
            placeholder="Ask me anything about my work..." 
            maxlength="500"
            autocomplete="off"
          >
          <button type="submit" id="chatbot-send" aria-label="Send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>

        <div class="chatbot-footer">
          <small>Powered by AI • <span id="chat-model">Groq AI</span></small>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
  }

  attachEventListeners() {
    const button = document.getElementById("chatbot-button");
    const closeBtn = document.getElementById("chatbot-close");
    const form = document.getElementById("chatbot-form");
    const messagesDiv = document.getElementById("chatbot-messages");

    button.addEventListener("click", () => this.toggleChat());
    closeBtn.addEventListener("click", () => this.toggleChat());
    form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Quick actions
    messagesDiv.addEventListener("click", (e) => {
      if (e.target.classList.contains("quick-action")) {
        const message = e.target.dataset.message;
        this.sendMessage(message);
      }
    });

    // Auto-resize input
    const input = document.getElementById("chatbot-input");
    input.addEventListener("input", () => {
      if (input.value.length > 450) {
        input.style.borderColor = "#ff6b6b";
      } else {
        input.style.borderColor = "";
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById("chatbot-window");
    const button = document.getElementById("chatbot-button");
    const badge = document.getElementById("chatbot-badge");

    if (this.isOpen) {
      window.classList.add("open");
      button.classList.add("hidden");
      badge.style.display = "none";
      document.getElementById("chatbot-input").focus();
    } else {
      window.classList.remove("open");
      button.classList.remove("hidden");
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("chatbot-input");
    const message = input.value.trim();

    if (!message || this.isTyping) return;

    input.value = "";
    await this.sendMessage(message);
  }

  async sendMessage(message) {
    this.addMessage(message, "user");
    this.isTyping = true;
    this.showTyping();

    try {
      const response = await fetch(`${this.API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          history: this.conversationHistory.slice(-20), // Limit history size
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Network error");
      }

      const data = await response.json();

      // Update conversation history
      this.conversationHistory.push(
        { role: "user", content: message },
        { role: "assistant", content: data.message }
      );

      // Keep only last 20 messages (10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      setTimeout(() => {
        this.hideTyping();
        this.addMessage(data.message, "bot", data.source);

        // Update model badge
        const modelBadge = document.getElementById("chat-model");
        if (modelBadge && data.model) {
          modelBadge.textContent = data.source === "ai" ? "🤖 AI" : "💬 Auto";
        }
      }, 500);
    } catch (error) {
      console.error("Chat error:", error);
      this.hideTyping();

      // Friendly error message
      this.addMessage(
        "😊 I'm experiencing some technical difficulties at the moment. Here are other ways to reach me:\n\n" +
          "📧 Use the contact form on this page\n" +
          "� Connect with me on LinkedIn\n" +
          "� Check out my GitHub profile\n\n" +
          "Or try again in a moment!",
        "bot",
        "error"
      );
    } finally {
      this.isTyping = false;
    }
  }

  addMessage(text, type, source) {
    const messagesDiv = document.getElementById("chatbot-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${type}`;

    const avatar = type === "user" ? "👤" : "🤖";
    const sourceLabel =
      source === "ai"
        ? " <small>(AI)</small>"
        : source === "fallback"
        ? " <small>(Auto)</small>"
        : "";

    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <p>${this.formatMessage(text)}</p>
        ${source ? `<div class="message-source">${sourceLabel}</div>` : ""}
      </div>
    `;

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  formatMessage(text) {
    // Escape HTML to prevent XSS
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Convert line breaks
    text = text.replace(/\n/g, "<br>");

    // Convert URLs to links
    text = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Convert emails to mailto links
    text = text.replace(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g,
      '<a href="mailto:$1">$1</a>'
    );

    return text;
  }

  showTyping() {
    document.getElementById("chatbot-typing").style.display = "flex";
    const messagesDiv = document.getElementById("chatbot-messages");
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  hideTyping() {
    document.getElementById("chatbot-typing").style.display = "none";
  }
}

// Initialize chatbot when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    try {
      new Chatbot();
    } catch (error) {
      console.error("Failed to initialize chatbot:", error);
    }
  });
} else {
  try {
    new Chatbot();
  } catch (error) {
    console.error("Failed to initialize chatbot:", error);
  }
}
