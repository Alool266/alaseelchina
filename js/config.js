/* Site public config (safe to commit).
 * Web3Forms access keys are client-visible by design.
 * Prefer overriding with js/config.local.js (gitignored) for your real key.
 */
window.ALASEEL_SITE_CONFIG = Object.assign({}, window.ALASEEL_SITE_CONFIG, {
  WEB3FORMS_ACCESS_KEY: "YOUR_WEB3FORMS_ACCESS_KEY",
  CONTACT_EMAIL: "info@alaseelchina.com",
});
