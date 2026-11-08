# Cursor Prompt — Build Al-Aseel (الأصيل) Static Website

Copy everything below the line into Cursor as the project brief. Put the logo/favicon files from this pack into the project `assets/` (or root) folder first.

---

## Project

Build a **simple, premium, static marketing website** for **الأصيل / Al-Aseel** — a China → Gulf sourcing & import-export company.

- **Deploy target:** GitHub Pages (static only)
- **Domain:** `alaseelchina.com` (include a root file `CNAME` containing exactly: `alaseelchina.com`)
- **HTTPS:** GitHub Pages provides free HTTPS (works in Saudi Arabia)
- **No backend. No database. No registration. No login. No forms that need a server.** Contact = WhatsApp only.

## Brand (do NOT change)

| Item | Value |
|------|--------|
| Arabic name | الأصيل |
| English name | Al-Aseel |
| Tagline AR | للاستيراد والتصدير |
| Tagline EN | Import & Export · China → Gulf |
| Legal Chinese company | 义乌市络驷进出口有限公司 |
| Domain | https://alaseelchina.com |
| WhatsApp | +966 56 496 8411 |
| WhatsApp link | https://wa.me/966564968411 |

**Forbidden brands / names (never appear anywhere):** Manarat, منارات, Yiwu Lisa, إيوو ليزا, Lisa Company, or any other company name except 义乌市络驷进出口有限公司 / الأصيل / Al-Aseel.

## Assets (provided)

Use these files from the site pack:

- `logo.png` — main logo (horse + الأصيل)
- `favicon.ico`
- `favicon-32.png`
- `apple-touch-icon.png`
- Optional: `logo-192.png`, `logo-512.png` for PWA/manifest or OG

Place them under `/assets/` and reference correctly in HTML.

## Design system

- **Style:** Premium, clean, mobile-first, trust-building. Think luxury trade house, not startup clutter.
- **Colors:**
  - Navy primary: `#0B1F3A` (or close to logo navy)
  - Gold accent: `#C9A227` (UI accents, buttons hover, section lines — even if logo uses red accents)
  - White / off-white backgrounds: `#FFFFFF`, `#F7F5F0`
  - Soft gray text: `#5A6570`
- **Typography:**
  - Arabic: `Cairo` or `IBM Plex Sans Arabic` (Google Fonts)
  - English: `Inter` or `IBM Plex Sans`
- **Direction:** Default page is **Arabic RTL** (`lang="ar" dir="rtl"`). Provide a small language toggle (AR | EN) that switches visible copy without a framework (vanilla JS).
- **Layout:** Generous whitespace, large readable type, max content width ~1100px, soft shadows, rounded cards (12–16px), no heavy animations.
- **Mobile-first:** Sticky header, large tap targets, floating WhatsApp button always visible on mobile.

## Pages / sections (single-page is preferred)

One elegant `index.html` with smooth-scroll sections:

1. **Header / Nav**  
   Logo left (or right in RTL), links: الرئيسية · خدماتنا · كيف نعمل · تواصل · EN/AR toggle.

2. **Hero**  
   - Logo prominently  
   - Headline AR: `من الصين إلى الخليج — بثقة الأصيل`  
   - Sub: short line about sourcing, inspection, shipping, and honest dealing  
   - Primary CTA button → WhatsApp: `تواصل واتساب` → `https://wa.me/966564968411`  
   - Secondary soft text: `بدون تسجيل · رد سريع`

3. **Trust strip**  
   Short chips: الصين · السعودية والخليج · استيراد وتصدير · متابعة حتى التسليم

4. **Services** (4–6 cards)  
   Examples (write polished AR + EN):
   - البحث عن المصانع والموردين (Sourcing)
   - التفاوض على الأسعار والجودة (Negotiation)
   - فحص الجودة قبل الشحن (QC / Inspection)
   - الشحن والتخليص والتنسيق (Shipping & coordination)
   - عينات وتوريد حسب الطلب (Samples & custom orders)
   - حلول للأفراد والشركات في الخليج

5. **How it works** (3–4 numbered steps)  
   1) تواصل واتساب واشرح احتياجك  
   2) نبحث ونعرض لك خيارات وأسعار  
   3) تؤكد الطلب والدفع المتفق عليه  
   4) نتابع الإنتاج والشحن حتى وصول البضاعة  

6. **Why Al-Aseel**  
   Short bullets: شفافية، تواجد في الصين (Yiwu), تواصل عربي، اهتمام بالتفاصيل.

7. **Contact / Footer**  
   - WhatsApp number + big button  
   - Company Chinese name: 义乌市络驷进出口有限公司  
   - Domain  
   - © year الأصيل  
   - Optional tiny note: “موقع تعريفي — التواصل عبر واتساب فقط”

8. **Floating WhatsApp button**  
   Fixed bottom corner, green WhatsApp icon, links to `https://wa.me/966564968411`, `aria-label` accessible, prefilled optional text e.g. `مرحبا، أريد الاستفسار عن خدمة الاستيراد من الصين`.

## Technical requirements

- Pure static: `index.html`, `styles.css`, `script.js` (or inline if tiny). No React/Next/Vite required — keep it simple so GitHub Pages just works. Vanilla is preferred; a tiny static build is OK only if you also commit ready `docs/` or root HTML.
- Semantic HTML, good headings, alt text on logo.
- Meta tags: title, description, Open Graph, Twitter card, theme-color navy.
- Favicons linked: `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`.
- `CNAME` file at repo root: `alaseelchina.com`
- `robots.txt` allow all.
- Fast: compress images if needed; logo already provided.
- Accessible contrast; focus states on links/buttons.
- WhatsApp links must open in new tab (`target="_blank" rel="noopener"`).

## Suggested copy seeds

**Title:** الأصيل | استيراد وتصدير من الصين إلى الخليج  
**Description:** الأصيل للاستيراد والتصدير — نساعدك في البحث عن الموردين في الصين، التفاوض، الفحص، والشحن إلى السعودية والخليج. تواصل واتساب مباشرة.

**EN Hero:** From China to the Gulf — with Al-Aseel trust.  
**EN CTA:** Chat on WhatsApp

## Acceptance checklist

- [ ] Looks premium on iPhone and desktop
- [ ] Arabic RTL default + English toggle works
- [ ] Logo + favicons correct
- [ ] Every CTA goes to WhatsApp `966564968411`
- [ ] No signup, no fake login, no Manarat/Lisa names
- [ ] `CNAME` = `alaseelchina.com`
- [ ] Ready to push to GitHub → enable Pages → point Porkbun DNS (A/AAAA or CNAME) to GitHub Pages

## Deliverables for Cursor

1. Working static site files  
2. Brief `README.md` (EN) with GitHub Pages + custom domain steps  
3. Keep assets in `/assets/`

Build it now. Make the design feel expensive, calm, and trustworthy.
