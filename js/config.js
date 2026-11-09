/* Site public config (safe to commit).
 * Web3Forms access keys are client-visible by design.
 * Prefer overriding with js/config.local.js (gitignored) for your real key.
 */
window.ALASEEL_SITE_CONFIG = Object.assign({}, window.ALASEEL_SITE_CONFIG, {
  WEB3FORMS_ACCESS_KEY: "1fc1fef6-be59-4127-8100-f63676bd15e7",
  CONTACT_EMAIL: "info@alaseelchina.com",
  // Optional silent WhatsApp push via CallMeBot (leave empty until you have a key).
  // Setup: https://www.callmebot.com/blog/free-api-whatsapp-messages/
  CALLMEBOT_PHONE: "966564968411",
  CALLMEBOT_APIKEY: "",
});
