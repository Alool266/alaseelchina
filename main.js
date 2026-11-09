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
  const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
  const IMAGE_MAX_EDGE = 1280;
  const IMAGE_UPLOAD_ENDPOINT = "https://tmpfiles.org/api/v1/upload";
  const IMAGE_UPLOAD_EXPIRE_SEC = 172800; // 48h max on tmpfiles
  const DEFAULT_GREETING_AR =
    "مرحبا، أريد الاستفسار عن خدمة التوريد من الصين عبر الأصيل";
  const DEFAULT_GREETING_EN =
    "Hello, I’d like to inquire about China sourcing via Al Aseel";

  let lastEmailSubmitAt = 0;
  let photoPreviewObjectUrl = "";
  const attachmentInput = contactForm?.querySelector("[data-product-image]");
  const photoPreview = contactForm?.querySelector("[data-photo-preview]");
  const photoPreviewImg = contactForm?.querySelector("[data-photo-preview-img]");
  const photoPreviewClear = contactForm?.querySelector("[data-photo-preview-clear]");

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

  const readOptionalAttachment = () => {
    const file = attachmentInput?.files?.[0] || null;
    if (!file) {
      attachmentInput?.setCustomValidity("");
      return { ok: true, file: null };
    }

    const isEn = root.dataset.lang === "en";
    const isImage =
      typeof file.type === "string" && file.type.startsWith("image/");
    if (!isImage) {
      attachmentInput?.setCustomValidity(
        isEn
          ? "Please choose an image file."
          : "يرجى اختيار ملف صورة."
      );
      attachmentInput?.reportValidity();
      return { ok: false, file: null };
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      attachmentInput?.setCustomValidity(
        isEn
          ? "Image must be 5 MB or smaller."
          : "يجب ألا يتجاوز حجم الصورة 5 ميغابايت."
      );
      attachmentInput?.reportValidity();
      return { ok: false, file: null };
    }

    attachmentInput?.setCustomValidity("");
    return { ok: true, file };
  };

  const loadImageElement = (file) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("image_load_failed"));
      };
      img.src = url;
    });

  const clearPhotoPreview = () => {
    if (photoPreviewObjectUrl) {
      URL.revokeObjectURL(photoPreviewObjectUrl);
      photoPreviewObjectUrl = "";
    }
    if (photoPreviewImg) {
      photoPreviewImg.removeAttribute("src");
      photoPreviewImg.alt = "";
    }
    if (photoPreview) photoPreview.hidden = true;
  };

  const showPhotoPreview = (file) => {
    clearPhotoPreview();
    if (!file || !photoPreview || !photoPreviewImg) return;
    photoPreviewObjectUrl = URL.createObjectURL(file);
    photoPreviewImg.src = photoPreviewObjectUrl;
    photoPreviewImg.alt =
      root.dataset.lang === "en" ? "Selected product photo" : "صورة المنتج المختارة";
    photoPreview.hidden = false;
  };

  // Web3Forms native attachments require PRO. Compress then host a viewable HTTPS link.
  const compressImageToJpegBlob = async (file) => {
    const img = await loadImageElement(file);
    const scale = Math.min(
      1,
      IMAGE_MAX_EDGE / Math.max(img.naturalWidth || 1, img.naturalHeight || 1)
    );
    const width = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      const err = new Error("image_compress_failed");
      err.code = "image_compress_failed";
      throw err;
    }
    ctx.drawImage(img, 0, 0, width, height);

    const qualities = [0.78, 0.68, 0.58, 0.48];
    let blob = null;
    for (const quality of qualities) {
      blob = await new Promise((resolve) => {
        canvas.toBlob((result) => resolve(result), "image/jpeg", quality);
      });
      if (blob && blob.size <= 1.4 * 1024 * 1024) break;
    }

    if (!blob) {
      const err = new Error("image_compress_failed");
      err.code = "image_compress_failed";
      throw err;
    }

    return blob;
  };

  const uploadProductImage = async (blob, originalName) => {
    const safeName = String(originalName || "product")
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-ء-ي]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const fileName = `${safeName || "product"}.jpg`;
    const formData = new FormData();
    formData.append("file", blob, fileName);
    formData.append("expire", String(IMAGE_UPLOAD_EXPIRE_SEC));

    const response = await fetch(IMAGE_UPLOAD_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const pageUrl = String(data?.data?.url || "").trim();
    if (!response.ok || data?.status !== "success" || !pageUrl.startsWith("http")) {
      const err = new Error(data?.message || "image_upload_failed");
      err.code = "image_upload_failed";
      throw err;
    }

    return pageUrl;
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
    imageUrl,
    imageFileName,
  }) => {
    const hasImage = Boolean(imageUrl);
    const subject = hasImage
      ? isEn
        ? "Sourcing inquiry + photo — Al Aseel"
        : "استفسار توريد مع صورة — الأصيل"
      : isEn
        ? "Sourcing inquiry — Al Aseel"
        : "استفسار توريد — الأصيل";
    const fromName = name || (isEn ? "Website visitor" : "زائر الموقع");
    const lines = [];
    lines.push(isEn ? `Name: ${fromName}` : `الاسم: ${fromName}`);
    lines.push(isEn ? `Phone: ${phone}` : `الجوال: ${phone}`);
    lines.push(isEn ? `Reply-to: ${email}` : `للرد على: ${email}`);
    lines.push("");
    lines.push(message);

    if (hasImage) {
      lines.push("");
      lines.push("---");
      lines.push(
        isEn
          ? `Product photo (open to view/download; link available up to 48 hours${imageFileName ? `; original: ${imageFileName}` : ""}):`
          : `صورة المنتج (افتح للعرض/التحميل؛ الرابط متاح حتى 48 ساعة${imageFileName ? `؛ الملف الأصلي: ${imageFileName}` : ""}):`
      );
      lines.push(imageUrl);
    }

    const payload = {
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

    if (hasImage) {
      payload.product_photo_url = imageUrl;
      if (imageFileName) payload.product_image_filename = imageFileName;
    }

    return payload;
  };

  const submitViaWeb3Forms = async (fields, imageOptions = null) => {
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

    const payload = buildWeb3FormsPayload({
      ...fields,
      imageUrl: imageOptions?.url || null,
      imageFileName: imageOptions?.fileName || null,
    });
    const formData = new FormData();
    Object.entries(payload).forEach(([keyName, value]) => {
      formData.append(keyName, value == null ? "" : String(value));
    });

    // Do not set Content-Type: browser must add multipart boundary for FormData.
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      body: formData,
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
      err.apiMessage = data?.message || "";
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
    const attachment = readOptionalAttachment();
    if (!attachment.ok) return;

    setEmailBusy(true);
    setFormStatus(
      "pending",
      attachment.file
        ? "جاري رفع الصورة وإرسال رسالتك…"
        : "جاري إرسال رسالتك…",
      attachment.file
        ? "Uploading photo and sending your message…"
        : "Sending your message…"
    );

    try {
      let imageOptions = null;
      if (attachment.file) {
        const blob = await compressImageToJpegBlob(attachment.file);
        const imageUrl = await uploadProductImage(
          blob,
          attachment.file.name || "product.jpg"
        );
        imageOptions = {
          url: imageUrl,
          fileName: attachment.file.name || "product.jpg",
        };
      }

      await submitViaWeb3Forms(fields, imageOptions);

      setFormStatus(
        "success",
        "تم الإرسال بنجاح — سنرد قريباً على استفسارك.",
        "Sent successfully — we will reply soon."
      );
      contactForm.reset();
      clearPhotoPreview();
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
      } else if (
        error?.code === "image_too_large" ||
        error?.code === "image_compress_failed" ||
        error?.code === "image_upload_failed" ||
        error?.message === "image_load_failed"
      ) {
        setFormStatus(
          "error",
          "تعذّر رفع الصورة. جرّب صورة أصغر أو أعد الإرسال بدون صورة.",
          "Could not upload the photo. Try a smaller image, or send without a photo."
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

  attachmentInput?.addEventListener("change", (event) => {
    clearFieldErrorState(event.currentTarget);
    const file = event.currentTarget?.files?.[0] || null;
    if (!file) {
      clearPhotoPreview();
      return;
    }
    const checked = readOptionalAttachment();
    if (!checked.ok) {
      clearPhotoPreview();
      return;
    }
    showPhotoPreview(file);
  });

  photoPreviewClear?.addEventListener("click", () => {
    if (attachmentInput) attachmentInput.value = "";
    clearPhotoPreview();
    clearFieldErrorState(attachmentInput);
  });

})();
