(() => {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-lang-toggle]");
  const yearEl = document.querySelector("[data-year]");
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const contactForm = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");
  const emailBtn = contactForm?.querySelector('[data-send="email"]');

  const WA_NUMBER = "966564968411";
  const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
  const PLACEHOLDER_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";
  const SUBMIT_THROTTLE_MS = 8000;
  const DEFAULT_GREETING_AR =
    "مرحبا، أريد الاستفسار عن خدمة التوريد من الصين عبر الأصيل";
  const DEFAULT_GREETING_EN =
    "Hello, I’d like to inquire about China sourcing via Al Aseel";

  let lastEmailSubmitAt = 0;

  const siteConfig = () => window.ALASEEL_SITE_CONFIG || {};
  const contactEmail = () =>
    siteConfig().CONTACT_EMAIL || "info@alaseelchina.com";
  const accessKey = () =>
    String(siteConfig().WEB3FORMS_ACCESS_KEY || "").trim();

  const localConfigReady = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "js/config.local.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const applyPlaceholders = (isEn) => {
    document.querySelectorAll("[data-ar-placeholder]").forEach((el) => {
      const ar = el.getAttribute("data-ar-placeholder");
      const en = el.getAttribute("data-en-placeholder");
      if (ar != null && en != null) el.setAttribute("placeholder", isEn ? en : ar);
    });
  };

  const applyAriaLabels = (isEn) => {
    document.querySelectorAll("[data-ar-aria-label]").forEach((el) => {
      const ar = el.getAttribute("data-ar-aria-label");
      const en = el.getAttribute("data-en-aria-label");
      if (ar != null && en != null) el.setAttribute("aria-label", isEn ? en : ar);
    });
  };

  const setLang = (lang) => {
    const isEn = lang === "en";
    root.lang = isEn ? "en" : "ar";
    root.dir = isEn ? "ltr" : "rtl";
    root.dataset.lang = lang;
    document.querySelectorAll("[data-ar]").forEach((el) => {
      const ar = el.getAttribute("data-ar");
      const en = el.getAttribute("data-en");
      if (ar != null && en != null) el.textContent = isEn ? en : ar;
    });
    document.querySelectorAll("[data-ar-html]").forEach((el) => {
      const ar = el.getAttribute("data-ar-html");
      const en = el.getAttribute("data-en-html");
      if (ar != null && en != null) el.innerHTML = isEn ? en : ar;
    });
    applyPlaceholders(isEn);
    applyAriaLabels(isEn);
    if (toggle) {
      toggle.setAttribute("aria-pressed", isEn ? "true" : "false");
      toggle.textContent = isEn ? "AR" : "EN";
      toggle.setAttribute(
        "aria-label",
        isEn ? "التبديل إلى العربية" : "Switch to English"
      );
    }
    localStorage.setItem("alaseel-lang", lang);
  };

  const saved = localStorage.getItem("alaseel-lang");
  setLang(saved === "en" ? "en" : "ar");

  toggle?.addEventListener("click", () => {
    setLang(root.dataset.lang === "en" ? "ar" : "en");
  });

  navToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) =>
      el.classList.add("is-visible")
    );
  }

  const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

  const readContactFields = () => {
    const isEn = root.dataset.lang === "en";
    const name = (contactForm?.querySelector("#msg-name")?.value || "").trim();
    const email = (contactForm?.querySelector("#msg-email")?.value || "").trim();
    const phoneCc = (
      contactForm?.querySelector("#msg-phone-cc")?.value || "+966"
    ).trim();
    const phoneLocalRaw = (
      contactForm?.querySelector("#msg-phone")?.value || ""
    ).trim();
    const phoneLocal = digitsOnly(phoneLocalRaw).replace(/^0+/, "");
    const phone = phoneLocal ? `${phoneCc}${phoneLocal}` : "";
    const typed = (contactForm?.querySelector("#msg-body")?.value || "").trim();
    const botcheck = (
      contactForm?.querySelector("#msg-botcheck")?.value || ""
    ).trim();
    const greeting = isEn ? DEFAULT_GREETING_EN : DEFAULT_GREETING_AR;
    const message = typed || greeting;
    return {
      isEn,
      name,
      email,
      phone,
      phoneCc,
      phoneLocal,
      typed,
      message,
      botcheck,
    };
  };

  const buildWhatsAppUrl = ({ isEn, name, email, phone, message }) => {
    const parts = [];
    if (name) parts.push(isEn ? `Name: ${name}` : `الاسم: ${name}`);
    if (phone) parts.push(isEn ? `Phone: ${phone}` : `الجوال: ${phone}`);
    if (email) parts.push(isEn ? `Email: ${email}` : `البريد: ${email}`);
    if (parts.length) parts.push("");
    parts.push(message);
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(parts.join("\n"))}`;
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());

  const requireEmail = (email) => {
    const emailInput = contactForm?.querySelector("#msg-email");
    const isEn = root.dataset.lang === "en";
    if (email && isValidEmail(email)) {
      emailInput?.setCustomValidity("");
      return true;
    }
    emailInput?.setCustomValidity(
      !email
        ? isEn
          ? "Please enter your email."
          : "يرجى إدخال بريدك الإلكتروني."
        : isEn
          ? "Please enter a valid email address."
          : "يرجى إدخال بريد إلكتروني صحيح."
    );
    emailInput?.reportValidity();
    return false;
  };

  const requirePhone = (phoneLocal) => {
    const phoneInput = contactForm?.querySelector("#msg-phone");
    const isEn = root.dataset.lang === "en";
    if (phoneLocal && phoneLocal.length >= 7 && phoneLocal.length <= 15) {
      phoneInput?.setCustomValidity("");
      return true;
    }
    phoneInput?.setCustomValidity(
      isEn
        ? "Please enter a valid phone number."
        : "يرجى إدخال رقم جوال صحيح."
    );
    phoneInput?.reportValidity();
    return false;
  };

  const requireMessage = (typed) => {
    const messageInput = contactForm?.querySelector("#msg-body");
    if (typed) {
      messageInput?.setCustomValidity("");
      return true;
    }
    const isEn = root.dataset.lang === "en";
    messageInput?.setCustomValidity(
      isEn ? "Please enter your message." : "يرجى كتابة رسالتك."
    );
    messageInput?.reportValidity();
    return false;
  };

  const setFormStatus = (type, arText, enText) => {
    if (!formStatus) return;
    const isEn = root.dataset.lang === "en";
    formStatus.hidden = false;
    formStatus.dataset.state = type;
    formStatus.setAttribute("data-ar", arText);
    formStatus.setAttribute("data-en", enText);
    formStatus.textContent = isEn ? enText : arText;
    formStatus.classList.toggle("is-success", type === "success");
    formStatus.classList.toggle("is-error", type === "error");
    formStatus.classList.toggle("is-pending", type === "pending");
  };

  const clearFormStatus = () => {
    if (!formStatus) return;
    formStatus.hidden = true;
    formStatus.dataset.state = "";
    formStatus.textContent = "";
    formStatus.classList.remove("is-success", "is-error", "is-pending");
  };

  const setEmailBusy = (busy) => {
    if (!emailBtn) return;
    emailBtn.disabled = busy;
    emailBtn.setAttribute("aria-busy", busy ? "true" : "false");
    if (busy) {
      emailBtn.setAttribute("data-ar", "جاري الإرسال…");
      emailBtn.setAttribute("data-en", "Sending…");
      emailBtn.textContent =
        root.dataset.lang === "en" ? "Sending…" : "جاري الإرسال…";
    } else {
      emailBtn.setAttribute("data-ar", "إرسال بالبريد");
      emailBtn.setAttribute("data-en", "Send by email");
      emailBtn.textContent =
        root.dataset.lang === "en" ? "Send by email" : "إرسال بالبريد";
    }
  };

  const keyIsConfigured = (key) =>
    Boolean(key) && key !== PLACEHOLDER_KEY && !key.includes("YOUR_WEB3FORMS");

  const buildWeb3FormsPayload = ({
    isEn,
    name,
    email,
    phone,
    message,
    botcheck,
  }) => {
    const subject = isEn
      ? "Sourcing inquiry — Al Aseel"
      : "استفسار توريد — الأصيل";
    const fromName = name || (isEn ? "Website visitor" : "زائر الموقع");
    const lines = [];
    lines.push(isEn ? `Name: ${fromName}` : `الاسم: ${fromName}`);
    lines.push(isEn ? `Phone: ${phone}` : `الجوال: ${phone}`);
    lines.push(isEn ? `Reply-to: ${email}` : `للرد على: ${email}`);
    lines.push("");
    lines.push(message);

    return {
      access_key: accessKey(),
      subject,
      from_name: fromName,
      name: fromName,
      email,
      replyto: email,
      phone,
      message: lines.join("\n"),
      botcheck: botcheck || "",
      to: contactEmail(),
    };
  };

  const submitViaWeb3Forms = async (fields) => {
    await localConfigReady;
    const key = accessKey();
    if (!keyIsConfigured(key)) {
      const err = new Error("missing_key");
      err.code = "missing_key";
      throw err;
    }

    const now = Date.now();
    if (now - lastEmailSubmitAt < SUBMIT_THROTTLE_MS) {
      const err = new Error("throttled");
      err.code = "throttled";
      throw err;
    }

    if (fields.botcheck) {
      lastEmailSubmitAt = now;
      return { success: true, skipped: true };
    }

    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(buildWeb3FormsPayload(fields)),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || !data?.success) {
      const err = new Error(data?.message || "submit_failed");
      err.code = "submit_failed";
      throw err;
    }

    lastEmailSubmitAt = Date.now();
    return data;
  };

  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fields = readContactFields();
    if (!requireEmail(fields.email)) return;
    if (!requirePhone(fields.phoneLocal)) return;
    if (!requireMessage(fields.typed)) return;

    setEmailBusy(true);
    setFormStatus(
      "pending",
      "جاري إرسال رسالتك…",
      "Sending your message…"
    );

    try {
      await submitViaWeb3Forms(fields);
      setFormStatus(
        "success",
        "تم الإرسال بنجاح — سنرد قريباً على استفسارك.",
        "Sent successfully — we will reply soon."
      );
      contactForm.reset();
    } catch (error) {
      if (error?.code === "missing_key") {
        setFormStatus(
          "error",
          "الإرسال غير مفعّل بعد. أضف مفتاح Web3Forms في js/config.js أو js/config.local.js.",
          "Email is not configured yet. Add your Web3Forms key in js/config.js or js/config.local.js."
        );
      } else if (error?.code === "throttled") {
        setFormStatus(
          "error",
          "يرجى الانتظار قليلاً قبل إعادة الإرسال.",
          "Please wait a moment before sending again."
        );
      } else {
        setFormStatus(
          "error",
          "تعذّر الإرسال. حاول مرة أخرى أو تواصل عبر واتساب.",
          "Could not send. Try again or contact us on WhatsApp."
        );
      }
    } finally {
      setEmailBusy(false);
    }
  });

  contactForm
    ?.querySelector('[data-send="whatsapp"]')
    ?.addEventListener("click", () => {
      const fields = readContactFields();
      if (!requireEmail(fields.email)) return;
      if (!requirePhone(fields.phoneLocal)) return;
      if (!requireMessage(fields.typed)) return;
      window.open(buildWhatsAppUrl(fields), "_blank", "noopener,noreferrer");
    });

  const clearFieldErrorState = (input) => {
    input?.setCustomValidity("");
    if (formStatus && !formStatus.hidden && formStatus.dataset.state === "error") {
      clearFormStatus();
    }
  };

  contactForm?.querySelector("#msg-email")?.addEventListener("input", (event) => {
    clearFieldErrorState(event.currentTarget);
  });

  contactForm?.querySelector("#msg-phone")?.addEventListener("input", (event) => {
    clearFieldErrorState(event.currentTarget);
  });
  contactForm
    ?.querySelector("#msg-phone-cc")
    ?.addEventListener("change", () => {
      clearFieldErrorState(contactForm?.querySelector("#msg-phone"));
    });

  contactForm?.querySelector("#msg-body")?.addEventListener("input", (event) => {
    clearFieldErrorState(event.currentTarget);
  });

})();
