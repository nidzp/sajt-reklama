class CookieConsent {
  constructor() {
    this.consentKey = "cookie_consent";
    this.analyticsKey = "analytics_enabled";
    this.init();
  }

  init() {
    if (!this.hasConsent()) {
      this.showBanner();
    } else if (this.isAnalyticsEnabled()) {
      this.enableAnalytics();
    }
  }

  hasConsent() {
    return localStorage.getItem(this.consentKey) === "true";
  }

  isAnalyticsEnabled() {
    return localStorage.getItem(this.analyticsKey) === "true";
  }

  showBanner() {
    const banner = document.createElement("div");
    banner.id = "cookie-consent-banner";
    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-text">
          <h4>🍪 Kolačići (Cookies)</h4>
          <p>Koristimo kolačiće za poboljšanje vašeg iskustva. Klikanjem na "Prihvatam" pristajete na upotrebu kolačića.</p>
        </div>
        <div class="cookie-buttons">
          <button id="cookie-accept" class="btn btn-primary">Prihvatam</button>
          <button id="cookie-decline" class="btn btn-secondary">Odbij</button>
          <button id="cookie-settings" class="btn btn-link">Podešavanja</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    this.attachEventListeners();
  }

  attachEventListeners() {
    document.getElementById("cookie-accept")?.addEventListener("click", () => {
      this.acceptAll();
    });

    document.getElementById("cookie-decline")?.addEventListener("click", () => {
      this.declineAll();
    });

    document
      .getElementById("cookie-settings")
      ?.addEventListener("click", () => {
        this.showSettings();
      });
  }

  acceptAll() {
    localStorage.setItem(this.consentKey, "true");
    localStorage.setItem(this.analyticsKey, "true");
    this.enableAnalytics();
    this.hideBanner();
  }

  declineAll() {
    localStorage.setItem(this.consentKey, "true");
    localStorage.setItem(this.analyticsKey, "false");
    this.hideBanner();
  }

  showSettings() {
    const modal = document.createElement("div");
    modal.id = "cookie-settings-modal";
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Podešavanja Kolačića</h3>
          <div class="cookie-option">
            <label>
              <input type="checkbox" id="essential-cookies" checked disabled>
              <strong>Neophodni kolačići</strong>
              <p>Potrebni za rad sajta (uvek omogućeni)</p>
            </label>
          </div>
          <div class="cookie-option">
            <label>
              <input type="checkbox" id="analytics-cookies">
              <strong>Analitički kolačići</strong>
              <p>Pomažu nam da razumemo kako koristite sajt</p>
            </label>
          </div>
          <div class="modal-buttons">
            <button id="save-settings" class="btn btn-primary">Sačuvaj</button>
            <button id="close-modal" class="btn btn-secondary">Otkaži</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("save-settings")?.addEventListener("click", () => {
      const analyticsEnabled =
        document.getElementById("analytics-cookies").checked;
      localStorage.setItem(this.consentKey, "true");
      localStorage.setItem(this.analyticsKey, analyticsEnabled.toString());

      if (analyticsEnabled) {
        this.enableAnalytics();
      }

      modal.remove();
      this.hideBanner();
    });

    document.getElementById("close-modal")?.addEventListener("click", () => {
      modal.remove();
    });
  }

  enableAnalytics() {
    // Google Analytics integration
    const gaId = "G-XXXXXXXXXX"; // Replace with your GA ID

    if (window.gtag) return; // Already loaded

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", gaId);

    console.log("Analytics enabled");
  }

  hideBanner() {
    const banner = document.getElementById("cookie-consent-banner");
    if (banner) {
      banner.style.animation = "slideDown 0.3s ease-out";
      setTimeout(() => banner.remove(), 300);
    }
  }
}

// Initialize on DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new CookieConsent());
} else {
  new CookieConsent();
}
