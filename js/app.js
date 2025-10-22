(() => {
  const root = document.documentElement;
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const hamburger = document.querySelector('[data-hamburger]');
  const langToggle = document.querySelector('[data-lang-toggle]');
  const heroSection = document.querySelector('.hero');
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const sequenceElements = document.querySelectorAll('.reveal-sequence');
  const lightbox = document.querySelector('[data-lightbox-modal]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxCaption = document.querySelector('[data-lightbox-caption]');
  const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
  const closeLightboxButtons = document.querySelectorAll('[data-close-lightbox]');
  const contactForm = document.getElementById('contact-form');

  const STORAGE_KEY = 'vespera-preferred-language';
  const DEFAULT_LANGUAGE = 'en';

  let currentLanguage = DEFAULT_LANGUAGE;
  let lastFocusedElement = null;
  let heroSequenceInitialized = false;
  let heroSequenceActivated = false;
  const heroSequenceTimeouts = [];
  let revealObserver = null;
  const motionPreference = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let reduceMotion = motionPreference?.matches ?? false;

  const getLangSuffix = (lang) => (lang === 'en' ? 'En' : 'Sr');

  const setHamburgerLabel = () => {
    if (!hamburger) return;
    const isOpen = nav?.classList.contains('open');
    const langSuffix = getLangSuffix(currentLanguage);
    const key = isOpen ? `ariaClose${langSuffix}` : `ariaOpen${langSuffix}`;
    const label = hamburger.dataset[key];
    if (label) {
      hamburger.setAttribute('aria-label', label);
    }
  };

  const throttle = (fn, wait) => {
    let inThrottle = false;
    let savedArgs = null;
    let savedThis = null;

    return function throttledFn(...args) {
      if (inThrottle) {
        savedArgs = args;
        savedThis = this;
        return;
      }

      fn.apply(this, args);
      inThrottle = true;

      window.setTimeout(() => {
        inThrottle = false;
        if (savedArgs) {
          throttledFn.apply(savedThis, savedArgs);
          savedArgs = savedThis = null;
        }
      }, wait);
    };
  };

  const updateHeaderState = () => {
    if (!header || !heroSection) {
      return;
    }
    const heroHeight = heroSection.offsetHeight;
    const threshold = Math.max(60, heroHeight * 0.3);
    if (window.scrollY > threshold) {
      header.classList.add('scrolled');
      header.classList.remove('transparent');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('transparent');
    }
  };

  const closeMobileNav = () => {
    if (!nav || !hamburger) return;
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('is-active');
    document.body.classList.remove('menu-open');
    setHamburgerLabel();
  };

  const toggleMobileNav = () => {
    if (!nav || !hamburger) return;
    const isOpen = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.classList.toggle('is-active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    setHamburgerLabel();
  };

  const syncLanguageToggleState = (lang) => {
    if (langToggle) {
      langToggle.setAttribute('aria-pressed', lang === 'sr' ? 'true' : 'false');
    }
  };

  const updateOpenLightboxContent = (langSuffix) => {
    if (!lightbox || lightbox.hasAttribute('hidden')) {
      return;
    }
    const activeTriggerId = lightbox.dataset.activeTrigger;
    if (!activeTriggerId) {
      return;
    }
    const trigger = document.querySelector(`[data-lightbox][data-trigger-id="${activeTriggerId}"]`);
    if (!trigger) {
      return;
    }
    const caption = trigger.dataset[`caption${langSuffix}`];
    if (caption) {
      lightboxCaption.textContent = caption;
    }
    const triggerImage = trigger.querySelector('img');
    if (triggerImage) {
      const altTranslation = triggerImage.dataset[`i18nAlt${langSuffix}`];
      if (altTranslation) {
        lightboxImage.setAttribute('alt', altTranslation);
      }
    }
  };

  const applyLanguage = (lang) => {
    currentLanguage = lang;
    const langSuffix = getLangSuffix(lang);

    document.querySelectorAll('[data-i18n-en]').forEach((el) => {
      if (el.hasAttribute('data-lightbox-caption')) {
        return;
      }
      const translation = el.dataset[`i18n${langSuffix}`];
      if (typeof translation === 'string') {
        el.textContent = translation;
      }
    });

    document.querySelectorAll('[data-i18n-alt-en]').forEach((el) => {
      const translation = el.dataset[`i18nAlt${langSuffix}`];
      if (typeof translation === 'string') {
        el.setAttribute('alt', translation);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder-en]').forEach((el) => {
      const translation = el.dataset[`i18nPlaceholder${langSuffix}`];
      if (typeof translation === 'string') {
        el.setAttribute('placeholder', translation);
      }
    });

    document.querySelectorAll('[data-i18n-aria-en]').forEach((el) => {
      const translation = el.dataset[`i18nAria${langSuffix}`];
      if (typeof translation === 'string') {
        el.setAttribute('aria-label', translation);
      }
    });

    document.querySelectorAll('[data-i18n-content-en]').forEach((el) => {
      const translation = el.dataset[`i18nContent${langSuffix}`];
      if (typeof translation === 'string') {
        el.setAttribute('content', translation);
      }
    });

    const titleElement = document.querySelector('title[data-i18n-title-en]');
    if (titleElement) {
      const translation = titleElement.dataset[`i18nTitle${langSuffix}`];
      if (typeof translation === 'string') {
        document.title = translation;
        titleElement.textContent = translation;
      }
    }

    root.setAttribute('lang', lang === 'sr' ? 'sr' : 'en');
    root.dataset.lang = lang;
    root.dataset.currentLang = lang;

    syncLanguageToggleState(lang);
    updateOpenLightboxContent(langSuffix);
    setHamburgerLabel();

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // Ignore storage errors (e.g., privacy mode)
    }
  };

  const cycleLanguage = () => {
    const nextLang = currentLanguage === 'en' ? 'sr' : 'en';
    applyLanguage(nextLang);
  };

  const showSequenceImmediately = () => {
    heroSequenceTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    heroSequenceTimeouts.length = 0;
    sequenceElements.forEach((element) => element.classList.add('is-visible'));
    heroSequenceActivated = true;
  };

  const initSequences = () => {
    if (!sequenceElements.length) {
      return;
    }
    if (reduceMotion) {
      showSequenceImmediately();
      return;
    }
    if (heroSequenceActivated) {
      return;
    }
    heroSequenceActivated = true;
    sequenceElements.forEach((element, index) => {
      const delay = 200 + index * 200;
      const timeoutId = window.setTimeout(() => {
        element.classList.add('is-visible');
      }, delay);
      heroSequenceTimeouts.push(timeoutId);
    });
  };

  const initHeroSequence = () => {
    if (reduceMotion) {
      showSequenceImmediately();
      heroSequenceInitialized = true;
      return;
    }
    if (heroSequenceInitialized) {
      if (!heroSequenceActivated) {
        initSequences();
      }
      return;
    }
    heroSequenceInitialized = true;
    if (document.readyState === 'complete') {
      initSequences();
    } else {
      window.addEventListener('load', initSequences, { once: true });
    }
  };

  const createRevealObserver = () =>
    new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '40px',
      }
    );

  const initializeReveals = () => {
    if (!revealElements.length) {
      return;
    }
    if (reduceMotion) {
      revealObserver?.disconnect();
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    revealObserver?.disconnect();
    revealObserver = createRevealObserver();
    revealElements.forEach((element) => {
      if (!element.classList.contains('is-visible')) {
        revealObserver.observe(element);
      }
    });
  };

  const handleMotionPreferenceChange = (event) => {
    reduceMotion = event.matches;
    heroSequenceTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    heroSequenceTimeouts.length = 0;
    heroSequenceActivated = false;

    if (reduceMotion) {
      showSequenceImmediately();
      revealObserver?.disconnect();
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    sequenceElements.forEach((element) => element.classList.remove('is-visible'));
    revealElements.forEach((element) => element.classList.remove('is-visible'));
    initializeReveals();
    initSequences();
  };

  if (motionPreference) {
    const motionListener = (event) => handleMotionPreferenceChange(event);
    if (typeof motionPreference.addEventListener === 'function') {
      motionPreference.addEventListener('change', motionListener);
    } else if (typeof motionPreference.addListener === 'function') {
      motionPreference.addListener(motionListener);
    }
  }

  const focusableSelectors = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  const trapFocus = (event) => {
    if (!lightbox || lightbox.hasAttribute('hidden')) {
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const focusableElements = lightbox.querySelectorAll(focusableSelectors.join(','));
    const focusArray = Array.from(focusableElements);
    if (!focusArray.length) {
      event.preventDefault();
      return;
    }
    const first = focusArray[0];
    const last = focusArray[focusArray.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.setAttribute('src', '');
    lightboxImage.setAttribute('alt', '');
    lightboxCaption.textContent = '';
    document.body.classList.remove('lightbox-open');
    lightbox.dataset.activeTrigger = '';
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
    lightbox.removeEventListener('keydown', trapFocus);
  };

  const openLightbox = (trigger) => {
    if (!lightbox || !lightboxImage || !lightboxCaption) {
      return;
    }
    const langSuffix = getLangSuffix(currentLanguage);
    const src = trigger.dataset.image;
    const caption = trigger.dataset[`caption${langSuffix}`] || '';
    const triggerImg = trigger.querySelector('img');
    const altText = triggerImg ? triggerImg.dataset[`i18nAlt${langSuffix}`] : '';

    lightboxImage.setAttribute('src', src);
    lightboxImage.setAttribute('alt', altText || '');
    lightboxCaption.textContent = caption;
    lightbox.removeAttribute('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lastFocusedElement = document.activeElement;
    if (!trigger.dataset.triggerId) {
      trigger.dataset.triggerId = `lightbox-trigger-${Math.floor(Math.random() * 1e6)}`;
    }
    lightbox.dataset.activeTrigger = trigger.dataset.triggerId || '';
    const closeButton = lightbox.querySelector('.lightbox-close');
    if (closeButton) {
      closeButton.focus();
    }
    lightbox.addEventListener('keydown', trapFocus);
  };

  const initializeLightbox = () => {
    lightboxTriggers.forEach((trigger, index) => {
      if (!trigger.dataset.triggerId) {
        trigger.dataset.triggerId = `lightbox-trigger-${index + 1}`;
      }
      trigger.addEventListener('click', () => openLightbox(trigger));
    });

    closeLightboxButtons.forEach((button) => {
      button.addEventListener('click', closeLightbox);
    });

    if (lightbox) {
      lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
          closeLightbox();
        }
      });

      lightbox.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
          closeLightbox();
        }
      });
    }
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const toggleFieldError = (field, hasError) => {
    const fieldWrapper = field.closest('.form-field');
    if (!fieldWrapper) return;
    const error = fieldWrapper.querySelector('.input-error');
    if (!error) return;
    field.setAttribute('aria-invalid', hasError ? 'true' : 'false');
    error.hidden = !hasError;
  };

  const validateField = (field) => {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      return true;
    }
    const value = field.value.trim();
    let isValid = true;

    switch (field.name) {
      case 'name':
        isValid = value.length >= 2;
        break;
      case 'email':
        isValid = emailPattern.test(value);
        break;
      case 'message':
        isValid = value.length >= 10;
        break;
      default:
        isValid = true;
    }

    toggleFieldError(field, !isValid);
    return isValid;
  };

  const initializeContactForm = () => {
    if (!contactForm) return;
    const feedback = contactForm.querySelector('.form-feedback');
    const nameField = contactForm.elements.namedItem('name');
    const emailField = contactForm.elements.namedItem('email');
    const messageField = contactForm.elements.namedItem('message');

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = [nameField, emailField, messageField];
      let isValid = true;

      fields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          const fieldValid = validateField(field);
          if (!fieldValid) {
            isValid = false;
          }
        }
      });

      if (!isValid) {
        if (feedback) {
          feedback.hidden = true;
          feedback.classList.remove('is-visible');
        }
        return;
      }

      if (feedback) {
        feedback.hidden = false;
        feedback.classList.add('is-visible');
        window.setTimeout(() => {
          feedback.hidden = true;
          feedback.classList.remove('is-visible');
        }, 4000);
      }

      contactForm.reset();
      fields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          toggleFieldError(field, false);
        }
      });
    });

    contactForm.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        if (['name', 'email', 'message'].includes(target.name)) {
          validateField(target);
        }
      }
    });
  };

  const getInitialLanguage = () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'sr' || stored === 'en') {
        return stored;
      }
    } catch (error) {
      // Ignore storage errors
    }
    const browserLanguage = navigator.language || (Array.isArray(navigator.languages) ? navigator.languages[0] : null);
    if (typeof browserLanguage === 'string' && browserLanguage.toLowerCase().startsWith('sr')) {
      return 'sr';
    }
    return DEFAULT_LANGUAGE;
  };

  const initLanguageToggle = () => {
    if (!langToggle) return;
    langToggle.addEventListener('click', () => {
      cycleLanguage();
    });
  };

  const initNavigation = () => {
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileNav);
    }

    if (nav) {
      nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeMobileNav());
      });
    }

    window.addEventListener(
      'resize',
      throttle(() => {
        if (window.innerWidth > 992) {
          closeMobileNav();
        }
      }, 200)
    );
  };

  const initScrollWatcher = () => {
    updateHeaderState();
    window.addEventListener('scroll', throttle(updateHeaderState, 100));
    window.addEventListener('resize', throttle(updateHeaderState, 200));
  };

  const init = () => {
    currentLanguage = getInitialLanguage();
    applyLanguage(currentLanguage);
    initNavigation();
    initLanguageToggle();
    initHeroSequence();
    initializeReveals();
    initScrollWatcher();
    initializeLightbox();
    initializeContactForm();

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (nav?.classList.contains('open')) {
          closeMobileNav();
        }
        if (lightbox && !lightbox.hasAttribute('hidden')) {
          closeLightbox();
        }
      }
    });
  };

  init();
})();

