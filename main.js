(() => {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-lang-toggle]");
  const yearEl = document.querySelector("[data-year]");
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const contactForm = document.querySelector("[data-contact-form]");

  const WA_NUMBER = "966564968411";
  const CONTACT_EMAIL = "info@alaseelchina.com";
  const DEFAULT_GREETING_AR =
    "مرحبا، أريد الاستفسار عن خدمة التوريد من الصين عبر الأصيل";
  const DEFAULT_GREETING_EN =
    "Hello, I’d like to inquire about China sourcing via Al Aseel";

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const applyPlaceholders = (isEn) => {
    document.querySelectorAll("[data-ar-placeholder]").forEach((el) => {
      const ar = el.getAttribute("data-ar-placeholder");
      const en = el.getAttribute("data-en-placeholder");
      if (ar != null && en != null) el.setAttribute("placeholder", isEn ? en : ar);
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

  const readContactFields = () => {
    const isEn = root.dataset.lang === "en";
    const name = (contactForm?.querySelector("#msg-name")?.value || "").trim();
    const email = (contactForm?.querySelector("#msg-email")?.value || "").trim();
    const typed = (contactForm?.querySelector("#msg-body")?.value || "").trim();
    const greeting = isEn ? DEFAULT_GREETING_EN : DEFAULT_GREETING_AR;
    const message = typed || greeting;
    return { isEn, name, email, typed, message };
  };

  const buildMailtoUrl = ({ isEn, name, email, message }) => {
    const subject = isEn
      ? "Sourcing inquiry — Al Aseel"
      : "استفسار توريد — الأصيل";
    const lines = [];
    if (name) lines.push(isEn ? `Name: ${name}` : `الاسم: ${name}`);
    if (email) lines.push(isEn ? `Reply-to: ${email}` : `للرد على: ${email}`);
    if (lines.length) lines.push("");
    lines.push(message);
    const body = lines.join("\n");
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const buildWhatsAppUrl = ({ isEn, name, email, message }) => {
    const parts = [];
    if (name) parts.push(isEn ? `Name: ${name}` : `الاسم: ${name}`);
    if (email) parts.push(isEn ? `Email: ${email}` : `البريد: ${email}`);
    if (parts.length) parts.push("");
    parts.push(message);
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(parts.join("\n"))}`;
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

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = readContactFields();
    if (!requireMessage(fields.typed)) return;
    window.location.href = buildMailtoUrl(fields);
  });

  contactForm
    ?.querySelector('[data-send="whatsapp"]')
    ?.addEventListener("click", () => {
      const fields = readContactFields();
      if (!requireMessage(fields.typed)) return;
      window.open(buildWhatsAppUrl(fields), "_blank", "noopener,noreferrer");
    });

  contactForm?.querySelector("#msg-body")?.addEventListener("input", (event) => {
    event.currentTarget.setCustomValidity("");
  });
})();
