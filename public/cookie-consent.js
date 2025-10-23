class CookieConsent {
  constructor() {
    this.consentKey = "cookie_consent";
    this.analyticsKey = "analytics_enabled";
    this.init();
  }

  init() {
    if (!this.hasConsent()) {
      setTimeout(() => this.showBanner(), 1000);
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
          <p>Koristimo kolačiće za poboljšanje vašeg iskustva na sajtu. Klikanjem na "Prihvatam sve" pristajete na upotrebu svih kolačića.</p>
        </div>
        <div class="cookie-buttons">
          <button id="cookie-accept" class="btn btn-primary">Prihvatam sve</button>
          <button id="cookie-decline" class="btn btn-secondary">Samo neophodni</button>
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
    this.showToast("Kolačići prihvaćeni ✓");
  }

  declineAll() {
    localStorage.setItem(this.consentKey, "true");
    localStorage.setItem(this.analyticsKey, "false");
    this.hideBanner();
    this.showToast("Sačuvani samo neophodni kolačići");
  }

  showSettings() {
    const modal = document.createElement("div");
    modal.id = "cookie-settings-modal";
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Podešavanja Kolačića</h3>
          <p class="modal-description">Upravljajte kolačićima koji se koriste na ovom sajtu.</p>
          
          <div class="cookie-option">
            <label>
              <div class="cookie-option-header">
                <input type="checkbox" id="essential-cookies" checked disabled>
                <strong>Neophodni kolačići</strong>
              </div>
              <p>Potrebni za osnovno funkcionisanje sajta. Ne mogu se isključiti.</p>
            </label>
          </div>
          
          <div class="cookie-option">
            <label>
              <div class="cookie-option-header">
                <input type="checkbox" id="analytics-cookies" checked>
                <strong>Analitički kolačići</strong>
              </div>
              <p>Pomažu nam da razumemo kako koristite sajt i da poboljšamo vaše iskustvo.</p>
            </label>
          </div>
          
          <div class="modal-buttons">
            <button id="save-settings" class="btn btn-primary">Sačuvaj podešavanja</button>
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
      this.showToast("Podešavanja sačuvana ✓");
    });

    document.getElementById("close-modal")?.addEventListener("click", () => {
      modal.remove();
    });

    modal.querySelector(".modal-overlay")?.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        modal.remove();
      }
    });
  }

  enableAnalytics() {
    const gaId = "G-XXXXXXXXXX"; // Replace with actual GA ID from .env

    if (window.gtag) {
      console.log("Analytics already loaded");
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", gaId, {
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
    });

    console.log("✓ Analytics enabled");
  }

  hideBanner() {
    const banner = document.getElementById("cookie-consent-banner");
    if (banner) {
      banner.style.animation = "slideDown 0.3s ease-out";
      setTimeout(() => banner.remove(), 300);
    }
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "cookie-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize on DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new CookieConsent());
} else {
  new CookieConsent();
}
