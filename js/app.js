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

  let currentLanguage = 'en';
  let lastFocusedElement = null;

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

      setTimeout(() => {
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
  };

  const toggleMobileNav = () => {
    if (!nav || !hamburger) return;
    const isOpen = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.classList.toggle('is-active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  };

  let heroSequenceActivated = false;

  const applyLanguage = (lang) => {
    currentLanguage = lang;
    const langSuffix = lang === 'en' ? 'En' : 'Sr';

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

    if (lightbox && !lightbox.hasAttribute('hidden')) {
      const activeTriggerId = lightbox.dataset.activeTrigger;
      if (activeTriggerId) {
        const trigger = document.querySelector(`[data-lightbox][data-trigger-id="${activeTriggerId}"]`);
        if (trigger) {
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
        }
      }
    }

    root.setAttribute('lang', lang === 'en' ? 'en' : 'sr');
    root.dataset.lang = lang;
  };

  const cycleLanguage = () => {
    const nextLang = currentLanguage === 'en' ? 'sr' : 'en';
    applyLanguage(nextLang);
  };

  const initSequences = () => {
    if (heroSequenceActivated) return;
    heroSequenceActivated = true;
    sequenceElements.forEach((element, index) => {
      const delay = 200 + index * 200;
      setTimeout(() => {
        element.classList.add('is-visible');
      }, delay);
    });
  };

  const revealObserver = new IntersectionObserver(
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

  revealElements.forEach((element) => revealObserver.observe(element));

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
    const langSuffix = currentLanguage === 'en' ? 'En' : 'Sr';
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
    const triggerId = trigger.dataset.triggerId;
    if (triggerId) {
      lightbox.dataset.activeTrigger = triggerId;
    }
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

  const initializeContactForm = () => {
    if (!contactForm) return;
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const feedback = contactForm.querySelector('.form-feedback');
      if (feedback) {
        feedback.hidden = false;
        feedback.classList.add('is-visible');
        setTimeout(() => {
          feedback.hidden = true;
          feedback.classList.remove('is-visible');
        }, 4000);
      }
      contactForm.reset();
    });
  };

  const initHeroSequence = () => {
    window.addEventListener('load', initSequences);
    if (document.readyState === 'complete') {
      initSequences();
    }
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
    applyLanguage(currentLanguage);
    initHeroSequence();
    initNavigation();
    initScrollWatcher();
    initializeLightbox();
    initializeContactForm();
    initLanguageToggle();

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav?.classList.contains('open')) {
        closeMobileNav();
      }
    });
  };

  init();
})();
