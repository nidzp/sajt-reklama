/* ==========================================
   PREMIUM ANIMATION ENGINE
   Main.js - Scroll Reveal, Parallax, & Effects
   ========================================== */

// ==========================================
// 1. INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
// ==========================================

const revealElements = document.querySelectorAll(".reveal");
const revealGroups = document.querySelectorAll(".reveal-group");

const observerOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -100px 0px",
};

const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      // Optional: Stop observing after revealed
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all reveal elements
revealElements.forEach((el) => revealObserver.observe(el));
revealGroups.forEach((el) => revealObserver.observe(el));

// ==========================================
// 2. PARALLAX EFFECT ON SCROLL
// ==========================================

class ParallaxController {
  constructor() {
    this.parallaxLayers = document.querySelectorAll(".parallax-layer");
    this.parallaxContainers = document.querySelectorAll(".parallax-container");
    this.speed = 0.5;
    this.init();
  }

  init() {
    if (this.parallaxLayers.length > 0) {
      window.addEventListener("scroll", () => this.updateParallax());
      window.addEventListener("mousemove", (e) => this.updateMouseParallax(e));
    }
  }

  updateParallax() {
    const scrollY = window.scrollY;

    this.parallaxLayers.forEach((layer) => {
      const rect = layer.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const distance = scrollY - elementTop;

      // Only apply parallax if element is in viewport
      if (distance > -1000 && distance < window.innerHeight + 1000) {
        const offset = distance * this.speed;
        layer.style.transform = `translateY(${offset}px)`;
      }
    });
  }

  updateMouseParallax(e) {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const angleX = ((clientY - centerY) / centerY) * 10;
    const angleY = ((clientX - centerX) / centerX) * 10;

    this.parallaxLayers.forEach((layer, index) => {
      const intensity = (index + 1) * 0.5;
      layer.style.transform = `perspective(1000px) rotateX(${
        angleX * intensity
      }deg) rotateY(${angleY * intensity}deg)`;
    });
  }
}

// Initialize Parallax
const parallaxController = new ParallaxController();

// ==========================================
// 3. SMOOTH SCROLL TO SECTION (Navigation)
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#" && href !== "#top") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - 100; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }
  });
});

// ==========================================
// 4. FORM VALIDATION & SUBMISSION
// ==========================================

class FormController {
  constructor() {
    this.forms = document.querySelectorAll("form");
    this.init();
  }

  init() {
    this.forms.forEach((form) => {
      form.addEventListener("submit", (e) => this.handleSubmit(e, form));

      // Real-time validation
      const inputs = form.querySelectorAll("input, textarea");
      inputs.forEach((input) => {
        input.addEventListener("blur", () => this.validateField(input));
        input.addEventListener("focus", () => this.clearError(input));
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const isValid = this.isFieldValid(field, value);

    if (!isValid) {
      field.classList.add("error");
      this.showError(field, this.getErrorMessage(field));
    } else {
      field.classList.remove("error");
      this.clearError(field);
    }

    return isValid;
  }

  isFieldValid(field, value) {
    const type = field.type;
    const name = field.name;

    if (value === "") return false;
    if (type === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (type === "tel") {
      return /^[\d\s\-\+\(\)]+$/.test(value);
    }

    return true;
  }

  getErrorMessage(field) {
    const type = field.type;
    if (type === "email") return "Please enter a valid email address";
    if (type === "tel") return "Please enter a valid phone number";
    if (type === "text") return "This field is required";
    return "Please fill in this field";
  }

  showError(field, message) {
    let errorEl = field.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("error-message")) {
      errorEl = document.createElement("span");
      errorEl.className = "error-message";
      field.parentNode.insertBefore(errorEl, field.nextSibling);
    }
    errorEl.textContent = message;
    errorEl.style.color = "#ff6b6b";
    errorEl.style.fontSize = "var(--text-xs)";
    errorEl.style.marginTop = "var(--spacing-xs)";
  }

  clearError(field) {
    const errorEl = field.nextElementSibling;
    if (errorEl && errorEl.classList.contains("error-message")) {
      errorEl.remove();
    }
  }

  handleSubmit(e, form) {
    e.preventDefault();

    // Validate all fields
    const fields = form.querySelectorAll("input, textarea");
    let isFormValid = true;

    fields.forEach((field) => {
      if (!this.validateField(field)) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      // Show success message
      this.showSuccessMessage(form);

      // Reset form
      form.reset();

      // Optional: Send to server (implement your backend)
      console.log("Form submitted successfully");
    }
  }

  showSuccessMessage(form) {
    const successMsg = document.createElement("div");
    successMsg.className = "success-message";
    successMsg.textContent = "✓ Thank you! We'll be in touch soon.";
    successMsg.style.cssText = `
      background: rgba(76, 175, 80, 0.1);
      border: 2px solid #4caf50;
      color: #4caf50;
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
      animation: fadeInUp var(--duration-normal) var(--easing-ease-out);
    `;

    form.insertBefore(successMsg, form.firstChild);

    // Remove after 4 seconds
    setTimeout(() => {
      successMsg.style.opacity = "0";
      successMsg.style.transition = "opacity var(--duration-normal)";
      setTimeout(() => successMsg.remove(), 300);
    }, 4000);
  }
}

// Initialize Forms
const formController = new FormController();

// ==========================================
// 5. NAVIGATION HIGHLIGHT ON SCROLL
// ==========================================

class NavController {
  constructor() {
    this.navLinks = document.querySelectorAll('nav a[href^="#"]');
    this.sections = document.querySelectorAll("section[id]");
    this.init();
  }

  init() {
    if (this.sections.length > 0) {
      window.addEventListener("scroll", () => this.updateActiveLink());
    }
  }

  updateActiveLink() {
    let current = "";

    this.sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    this.navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  }
}

// Initialize Navigation Controller
const navController = new NavController();

// ==========================================
// 6. LAZY LOAD IMAGES
// ==========================================

class LazyLoadController {
  constructor() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    this.init();
  }

  init() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.add("loaded");
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: "50px",
        }
      );

      this.images.forEach((img) => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      this.images.forEach((img) => {
        img.src = img.dataset.src;
      });
    }
  }
}

// Initialize Lazy Load
const lazyLoadController = new LazyLoadController();

// ==========================================
// 7. MOBILE MENU TOGGLE
// ==========================================

class MobileMenuController {
  constructor() {
    this.hamburger = document.querySelector(".menu-toggle");
    this.navMenu = document.querySelector("nav ul");
    this.init();
  }

  init() {
    if (this.hamburger) {
      this.hamburger.addEventListener("click", () => this.toggleMenu());

      // Close menu when link clicked
      document.querySelectorAll("nav a").forEach((link) => {
        link.addEventListener("click", () => this.closeMenu());
      });
    }
  }

  toggleMenu() {
    this.hamburger.classList.toggle("active");
    this.navMenu.classList.toggle("active");
  }

  closeMenu() {
    this.hamburger.classList.remove("active");
    this.navMenu.classList.remove("active");
  }
}

// Initialize Mobile Menu
const mobileMenuController = new MobileMenuController();

// ==========================================
// 8. SMOOTH PAGE LOAD ANIMATION
// ==========================================

window.addEventListener("load", () => {
  document.body.classList.add("loaded");

  // Trigger reveal animations on visible elements
  revealElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add("active");
    }
  });
});

// ==========================================
// 9. UTILITY: DEBOUNCE FUNCTION
// ==========================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// 10. PERFORMANCE MONITORING (Optional)
// ==========================================

if (window.performance && window.performance.timing) {
  window.addEventListener("load", () => {
    const timing = window.performance.timing;
    const navigation = window.performance.navigation;

    const loadTime = timing.loadEventEnd - timing.navigationStart;

    console.log(
      `%c⚡ Page Load Time: ${loadTime}ms`,
      "color: #d4af37; font-weight: bold;"
    );

    if (loadTime > 3000) {
      console.warn(
        "⚠️ Page load took longer than expected. Consider optimizing assets."
      );
    }
  });
}

// ==========================================
// 11. EXPORT FOR TESTING
// ==========================================

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ParallaxController,
    FormController,
    NavController,
    LazyLoadController,
    MobileMenuController,
  };
}

console.log(
  "%c🎬 Premium Animation Engine Loaded",
  "color: #d4af37; font-weight: bold; font-size: 14px;"
);
