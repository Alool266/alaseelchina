/* Site public config (safe to commit).
 * Web3Forms access keys are client-visible by design.
 * Prefer overriding with js/config.local.js (gitignored) for your real key.
 */
window.ALASEEL_SITE_CONFIG = Object.assign({}, window.ALASEEL_SITE_CONFIG, {
  WEB3FORMS_ACCESS_KEY: "1fc1fef6-be59-4127-8100-f63676bd15e7",
  CONTACT_EMAIL: "info@alaseelchina.com",
});
