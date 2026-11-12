/**
 * EUGÊNIO CELULARES — SCRIPT PRINCIPAL & SISTEMA DE AUDITORIA QA
 * Funcionalidades interativas, simulador de orçamento, validação robusta de formulário,
 * controle de modais, FAQ accordion, integração com WhatsApp, Consent Mode LGPD e Analytics.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constantes de contato oficial
  const OFFICIAL_PHONE_CLEAN = '5585988034843';
  const OFFICIAL_PHONE_FORMATTED = '(85) 98803-4843';

  /* ==========================================================================
     0. GERENCIADOR DE COOKIES & PRIVACIDADE LGPD
     ========================================================================== */
  const COOKIE_STORAGE_KEY = 'eugenio_cookie_consent_v1';
  const cookieBanner = document.getElementById('cookieConsentBanner');
  const cookiePrefsModal = document.getElementById('cookiePrefsModal');
  const cookieAcceptAllBtn = document.getElementById('cookieAcceptAllBtn');
  const cookieRejectAllBtn = document.getElementById('cookieRejectAllBtn');
  const cookieOpenPrefsBtns = document.querySelectorAll('.open-cookie-prefs-btn');
  const cookieSavePrefsBtn = document.getElementById('cookieSavePrefsBtn');
  const closeCookiePrefsBtn = document.getElementById('closeCookiePrefsBtn');
  const consentAnalyticsCheckbox = document.getElementById('consentAnalyticsCheckbox');

  function getStoredConsent() {
    try {
      const data = localStorage.getItem(COOKIE_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consentObj) {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consentObj));
    } catch (e) {
      console.warn('LocalStorage indisponível para salvar consentimento.');
    }
    applyConsent(consentObj);
  }

  function applyConsent(consentObj) {
    if (cookieBanner) {
      cookieBanner.classList.add('hidden');
    }
    if (cookiePrefsModal) {
      cookiePrefsModal.classList.remove('show');
      document.body.classList.remove('overflow-hidden');
    }

    // Se o usuário aceitou cookies analíticos, inicializa o rastreamento
    if (consentObj && consentObj.analytics) {
      initAnalytics();
    }
  }

  const currentConsent = getStoredConsent();
  if (!currentConsent) {
    if (cookieBanner) {
      setTimeout(() => {
        cookieBanner.classList.remove('hidden');
      }, 800);
    }
  } else {
    applyConsent(currentConsent);
  }

  if (cookieAcceptAllBtn) {
    cookieAcceptAllBtn.addEventListener('click', () => {
      saveConsent({ essential: true, analytics: true, timestamp: new Date().toISOString() });
    });
  }

  if (cookieRejectAllBtn) {
    cookieRejectAllBtn.addEventListener('click', () => {
      saveConsent({ essential: true, analytics: false, timestamp: new Date().toISOString() });
    });
  }

  cookieOpenPrefsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const c = getStoredConsent();
      if (consentAnalyticsCheckbox) {
        consentAnalyticsCheckbox.checked = c ? !!c.analytics : false;
      }
      if (cookiePrefsModal) {
        cookiePrefsModal.classList.add('show');
        document.body.classList.add('overflow-hidden');
      }
    });
  });

  if (closeCookiePrefsBtn && cookiePrefsModal) {
    closeCookiePrefsBtn.addEventListener('click', () => {
      cookiePrefsModal.classList.remove('show');
      document.body.classList.remove('overflow-hidden');
    });
  }

  if (cookieSavePrefsBtn) {
    cookieSavePrefsBtn.addEventListener('click', () => {
      const allowsAnalytics = consentAnalyticsCheckbox ? consentAnalyticsCheckbox.checked : false;
      saveConsent({ essential: true, analytics: allowsAnalytics, timestamp: new Date().toISOString() });
    });
  }

  /* ==========================================================================
     0.1. GOOGLE ANALYTICS 4 (GA4) & EVENT TRACKER
     ========================================================================== */
  // O ID oficial do GA4 poderá ser inserido abaixo pela equipe de tráfego/empresa
  const GA4_MEASUREMENT_ID = ''; // Exemplo: 'G-XXXXXXXXXX'

  function initAnalytics() {
    if (!GA4_MEASUREMENT_ID) {
      return; // Pronto para ativação imediata sem uso de ID fictício
    }
    if (window._ga4Initialized) return;

    window._ga4Initialized = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  }

  // Despachante global de eventos de conversão
  window.trackEugenioEvent = function(eventName, eventParams) {
    const consent = getStoredConsent();
    if (consent && consent.analytics && typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams || {});
    }
  };

  // Rastreamento automático de cliques comerciais
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      const label = link.getAttribute('aria-label') || link.innerText.trim() || 'WhatsApp CTA';
      window.trackEugenioEvent('click_whatsapp', { source_button: label });
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      window.trackEugenioEvent('click_phone', { phone_number: link.getAttribute('href') });
    });
  });

  document.querySelectorAll('a[href*="instagram.com"]').forEach(link => {
    link.addEventListener('click', () => {
      window.trackEugenioEvent('click_instagram', { platform: 'instagram' });
    });
  });

  /* ==========================================================================
     1. MENU MOBILE & NAVEGAÇÃO
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
  const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
  const navLinks = document.querySelectorAll('.nav-anchor');
  const navbar = document.getElementById('mainNavbar');

  function openMobileMenu() {
    if (!mobileMenuDrawer || !mobileMenuBackdrop) return;
    mobileMenuDrawer.classList.remove('translate-x-full');
    mobileMenuBackdrop.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('overflow-hidden');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    if (!mobileMenuDrawer || !mobileMenuBackdrop) return;
    mobileMenuDrawer.classList.add('translate-x-full');
    mobileMenuBackdrop.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('overflow-hidden');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenuDrawer.classList.contains('translate-x-full');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Estilização dinâmica da navbar ao rolar
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('shadow-md', 'bg-white/95');
      navbar.classList.remove('bg-white/80');
    } else {
      navbar.classList.remove('shadow-md', 'bg-white/95');
      navbar.classList.add('bg-white/80');
    }
  });

  /* ==========================================================================
     2. SIMULADOR INTERATIVO DE ORÇAMENTO (QUAL É O SEU APARELHO?)
     ========================================================================== */
  let selectedBrand = 'Apple';
  let selectedIssue = 'Tela Quebrada';

  const brandButtons = document.querySelectorAll('.brand-btn');
  const issuePills = document.querySelectorAll('.issue-pill');
  const modelInput = document.getElementById('quoteModelInput');
  const generateQuoteBtn = document.getElementById('generateQuoteBtn');
  const quotePreviewText = document.getElementById('quotePreviewText');

  function updateQuotePreview() {
    const rawModel = modelInput ? modelInput.value.trim() : '';
    const model = rawModel || 'Não especificado';
    if (quotePreviewText) {
      quotePreviewText.textContent = `Aparelho: ${selectedBrand} (${model}) • Problema: ${selectedIssue}`;
    }
  }

  brandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      brandButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedBrand = btn.dataset.brand || btn.textContent.trim();
      updateQuotePreview();
    });
  });

  issuePills.forEach(pill => {
    pill.addEventListener('click', () => {
      issuePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedIssue = pill.dataset.issue || pill.textContent.trim();
      updateQuotePreview();
    });
  });

  if (modelInput) {
    modelInput.addEventListener('input', updateQuotePreview);
  }

  if (generateQuoteBtn) {
    generateQuoteBtn.addEventListener('click', () => {
      const rawModel = modelInput ? modelInput.value.trim() : '';
      const model = rawModel || 'Modelo a verificar';
      const message = `Olá, Eugênio Celulares! Gostaria de solicitar um orçamento para o meu smartphone:\n\n📱 Marca: ${selectedBrand}\n🔎 Modelo: ${model}\n⚠️ Problema relatado: ${selectedIssue}\n\nPoderiam me informar valores e tempo estimado de reparo?`;
      const encodedMsg = encodeURIComponent(message);
      const url = `https://wa.me/${OFFICIAL_PHONE_CLEAN}?text=${encodedMsg}`;
      
      window.trackEugenioEvent('quote_simulator_generated', {
        brand: selectedBrand,
        issue: selectedIssue,
        model: model
      });

      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  updateQuotePreview();

  /* ==========================================================================
     3. FILTRO DE ACESSÓRIOS
     ========================================================================== */
  const accessoryFilterButtons = document.querySelectorAll('.accessory-filter-btn');
  const accessoryCards = document.querySelectorAll('.accessory-card');

  accessoryFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      accessoryFilterButtons.forEach(b => {
        b.classList.remove('active', 'bg-[#0131CD]', 'text-white');
        b.classList.add('bg-slate-100', 'text-slate-700');
      });
      btn.classList.add('active', 'bg-[#0131CD]', 'text-white');
      btn.classList.remove('bg-slate-100', 'text-slate-700');

      const filter = btn.dataset.filter || 'all';

      accessoryCards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 180);
        }
      });
    });
  });

  /* ==========================================================================
     4. FAQ INTERATIVO EM ACCORDION — ANIMAÇÃO PREMIUM
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = content.classList.contains('open');

        // Fecha todos os outros
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherContent = otherItem.querySelector('.faq-content');
            const otherTrigger = otherItem.querySelector('.faq-trigger');
            if (otherContent) otherContent.classList.remove('open');
            otherItem.classList.remove('active');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle o atual
        if (isOpen) {
          content.classList.remove('open');
          item.classList.remove('active');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          content.classList.add('open');
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
          // Scroll suave para o item aberto em mobile
          setTimeout(() => {
            const rect = item.getBoundingClientRect();
            if (rect.top < 80) {
              item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 420);
        }
      });
    }
  });

  /* ==========================================================================
     5. FORMULÁRIO DE CONTATO & ORÇAMENTO COM VALIDAÇÃO ROBUSTA E SEGURANÇA
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const formSuccessBox = document.getElementById('formSuccessBox');
  const formPhoneInput = document.getElementById('contactPhone');

  // Sanitizador contra injeção de HTML / XSS
  function sanitizeInput(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  // Validador de formato de telefone brasileiro: pelo menos 10 dígitos com DDD
  function isValidBRPhone(phoneStr) {
    const digits = phoneStr.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  }

  // Máscara dinâmica de telefone brasileiro: (85) 99999-9999 ou (85) 9999-9999
  if (formPhoneInput) {
    formPhoneInput.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '');
      if (digits.length > 11) digits = digits.slice(0, 11);

      if (digits.length > 6) {
        e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else if (digits.length > 2) {
        e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else if (digits.length > 0) {
        e.target.value = `(${digits}`;
      } else {
        e.target.value = '';
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Proteção Antispam Honeypot
      const honeypot = document.getElementById('honeypot_field');
      if (honeypot && honeypot.value !== '') {
        console.warn('Proteção antispam ativada.');
        return;
      }

      const rawName = document.getElementById('contactName')?.value || '';
      const rawPhone = document.getElementById('contactPhone')?.value || '';
      const rawDevice = document.getElementById('contactDevice')?.value || '';
      const rawService = document.getElementById('contactService')?.value || '';
      const rawProblem = document.getElementById('contactProblem')?.value || '';

      const name = sanitizeInput(rawName.trim());
      const phone = sanitizeInput(rawPhone.trim());
      const device = sanitizeInput(rawDevice.trim());
      const service = sanitizeInput(rawService);
      const problem = sanitizeInput(rawProblem.trim());

      // Validação de campos obrigatórios
      if (!name || !phone || !device) {
        alert('Por favor, preencha todos os campos obrigatórios (Nome, WhatsApp e Aparelho).');
        return;
      }

      // Validação do telefone
      if (!isValidBRPhone(phone)) {
        alert('Por favor, informe um número de telefone ou WhatsApp válido com DDD (ex: (85) 98803-4843).');
        formPhoneInput.focus();
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Processando solicitação...
      `;

      setTimeout(() => {
        contactForm.classList.add('hidden');
        if (formSuccessBox) {
          formSuccessBox.classList.remove('hidden');
        }

        const waMessage = `Olá, Eugênio Celulares! Gostaria de solicitar um orçamento via formulário do site:\n\n👤 Nome: ${name}\n📞 WhatsApp: ${phone}\n📱 Aparelho: ${device}\n🔧 Serviço de Interesse: ${service}\n📝 Detalhes do Defeito: ${problem || 'Não informado'}\n\nAguardo retorno da equipe técnica!`;
        const encodedUrl = `https://wa.me/${OFFICIAL_PHONE_CLEAN}?text=${encodeURIComponent(waMessage)}`;

        const continueBtn = document.getElementById('continueToWhatsAppBtn');
        if (continueBtn) {
          continueBtn.href = encodedUrl;
        }

        window.trackEugenioEvent('contact_form_submitted', {
          service: service,
          device: device
        });

        window.open(encodedUrl, '_blank', 'noopener,noreferrer');
      }, 600);
    });
  }

  /* ==========================================================================
     6. GERENCIAMENTO DE MODAIS (ORÇAMENTO RÁPIDO & POLÍTICA DE PRIVACIDADE)
     ========================================================================== */
  const openQuoteModalBtns = document.querySelectorAll('.open-quote-modal-btn');
  const quoteModal = document.getElementById('quoteModal');
  const closeQuoteModalBtn = document.getElementById('closeQuoteModalBtn');

  const openPrivacyModalBtns = document.querySelectorAll('.open-privacy-modal-btn');
  const privacyModal = document.getElementById('privacyModal');
  const closePrivacyModalBtn = document.getElementById('closePrivacyModalBtn');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('show');
    document.body.classList.add('overflow-hidden');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.classList.remove('overflow-hidden');
  }

  openQuoteModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(quoteModal);
    });
  });

  if (closeQuoteModalBtn) {
    closeQuoteModalBtn.addEventListener('click', () => closeModal(quoteModal));
  }

  const modalQuoteForm = document.getElementById('modalQuoteForm');
  if (modalQuoteForm) {
    modalQuoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawDevice = document.getElementById('modalDevice')?.value || '';
      const rawIssue = document.getElementById('modalIssue')?.value || '';
      const rawName = document.getElementById('modalClientName')?.value || '';

      const device = sanitizeInput(rawDevice.trim());
      const issue = sanitizeInput(rawIssue);
      const clientName = sanitizeInput(rawName.trim());

      if (!device) {
        alert('Por favor, informe o modelo do aparelho.');
        return;
      }

      const greeting = clientName ? `Olá! Me chamo ${clientName}` : 'Olá!';
      const waMsg = `${greeting}, gostaria de um orçamento na Eugênio Celulares:\n\n📱 Aparelho: ${device}\n⚠️ Defeito: ${issue}\n\nPoderiam me informar valores e tempo estimado?`;
      const targetUrl = `https://wa.me/${OFFICIAL_PHONE_CLEAN}?text=${encodeURIComponent(waMsg)}`;
      
      closeModal(quoteModal);
      modalQuoteForm.reset();

      window.trackEugenioEvent('quote_modal_submitted', {
        device: device,
        issue: issue
      });

      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    });
  }

  openPrivacyModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(privacyModal);
    });
  });

  if (closePrivacyModalBtn) {
    closePrivacyModalBtn.addEventListener('click', () => closeModal(privacyModal));
  }

  [quoteModal, privacyModal, cookiePrefsModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(quoteModal);
      closeModal(privacyModal);
      if (cookiePrefsModal) closeModal(cookiePrefsModal);
      closeMobileMenu();
    }
  });

  /* ==========================================================================
     7. BOTÃO FLUTUANTE DE WHATSAPP
     ========================================================================== */
  const waFloatingClose = document.getElementById('waFloatingTooltipClose');
  const waFloatingTooltip = document.getElementById('waFloatingTooltip');

  if (waFloatingClose && waFloatingTooltip) {
    waFloatingClose.addEventListener('click', (e) => {
      e.stopPropagation();
      waFloatingTooltip.style.display = 'none';
    });
  }
});
