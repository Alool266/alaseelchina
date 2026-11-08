# الأصيل / Al Aseel — static site

Premium one-page marketing site for **الأصيل للاستيراد والتصدير** (Al Aseel Import & Export).

- Domain: `alaseelchina.com` (`CNAME` included)
- Stack: static HTML / CSS / JS (GitHub Pages)
- Contact inbox: `info@alaseelchina.com`
- Brand colors: navy `#0B2A5B`, red `#D7262E`, background `#F5F7FB`

## Contact form (real email)

The «إرسال بالبريد» button posts to **[Web3Forms](https://web3forms.com)**  
`POST https://api.web3forms.com/submit` — no custom server, no `mailto`.

Messages are delivered to **`info@alaseelchina.com`** and include name, optional reply email, and message. WhatsApp / Telegram links are unchanged.

### Env / keys

| Name | Where to set | Notes |
| --- | --- | --- |
| `WEB3FORMS_ACCESS_KEY` | `js/config.js` **or** `js/config.local.js` | Required for email send. Client-visible by design. |
| (documented only) | `.env.example` | Static Pages do **not** load `.env`; use the JS config files. |

Destination email is configured in the Web3Forms dashboard as `info@alaseelchina.com` (also sent as `to` in the payload).

### Activate email (one-time)

1. Sign up at [https://web3forms.com](https://web3forms.com)
2. Create a form with email **`info@alaseelchina.com`**
3. Copy the **Access Key**
4. Paste it in one of:
   - **`js/config.js`** → `WEB3FORMS_ACCESS_KEY: "…"`  
   - **or** copy `js/config.local.example.js` → `js/config.local.js` (gitignored) and paste there

Until a real key is set, the form shows a clear Arabic/English configuration error (no silent fail).

### Verify a test send

1. Open the site locally or on GitHub Pages.
2. Go to **تواصل / Contact**.
3. Enter a short message (required); optional name + reply email.
4. Click **إرسال بالبريد**.
5. Expect on-page success: **«تم الإرسال بنجاح»**.
6. Check the **`info@alaseelchina.com`** inbox (and spam) for the message.
7. Confirm reply-to works when you filled بريدك للرد.

Spam protection: hidden `botcheck` honeypot + ~8s client throttle between email sends.

## Preview locally

```bash
npx --yes serve .
```

Visit the URL shown (usually `http://localhost:3000`).

## Deploy (GitHub Pages)

1. Push to `Alool266/alaseelchina`.
2. Settings → Pages → Deploy from branch (`main` / root).
3. Custom domain: `alaseelchina.com` (see `CNAME`).

## Brand notes

- Legal Chinese entity: 义乌市络驷进出口有限公司 / Yiwu Luosi Import & Export Co., Ltd.
- Do not use other company names on this site.
- Public contact email on the site: **info@alaseelchina.com** only.
