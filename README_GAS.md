# Google Apps Script Setup Guide

## Panduan Lengkap Setup Bot Telegram dengan Google Apps Script

### Prerequisites

1. **Node.js** terinstal di komputer
2. **Google Account**
3. **Telegram Bot Token** (dari @BotFather)
4. **OpenRouter API Key** (dari https://openrouter.ai)

---

## Langkah 1: Install Clasp

Clasp adalah CLI tool untuk mengelola Google Apps Script dari terminal.

```bash
npm install -g @google/clasp
```

Verifikasi instalasi:

```bash
clasp --version
```

---

## Langkah 2: Login ke Google Account

```bash
clasp login
```

Browser akan terbuka. Login dengan Google Account Anda dan izinkan akses.

---

## Langkah 3: Create Google Apps Script Project

Ada 2 cara:

### Cara A: Create via Clasp (Recommended)

```bash
# Pastikan Anda di root folder project
cd "d:/04 PROJECTS/PHOTO PROFILE 1.0/profile-picture-telegram-bot"

# Create new Apps Script project
clasp create --type webapp --title "Telegram Formal Photo Bot" --rootDir ./gas
```

Clasp akan membuat project dan menampilkan Script ID. Copy Script ID tersebut.

### Cara B: Create via Web

1. Buka https://script.google.com
2. Klik "New Project"
3. Beri nama "Telegram Formal Photo Bot"
4. Copy Script ID dari URL (format: `https://script.google.com/d/SCRIPT_ID/edit`)

---

## Langkah 4: Setup .clasp.json

Buat file `.clasp.json` di root folder project:

```json
{
  "scriptId": "PASTE_YOUR_SCRIPT_ID_HERE",
  "rootDir": "./gas"
}
```

Ganti `PASTE_YOUR_SCRIPT_ID_HERE` dengan Script ID Anda.

**PENTING:** File `.clasp.json` sudah ada di `.gitignore` untuk keamanan.

---

## Langkah 5: Push Code ke Google Apps Script

```bash
clasp push
```

Jika ada konflik, pilih opsi untuk overwrite.

Verifikasi dengan membuka editor:

```bash
clasp open
```

---

## Langkah 6: Set Script Properties (Environment Variables)

Script Properties adalah tempat menyimpan API keys dan konfigurasi.

### Via Apps Script Editor (Recommended):

1. Buka Apps Script Editor (`clasp open`)
2. Klik **Project Settings** (ikon gear di sidebar kiri)
3. Scroll ke bawah ke bagian **Script Properties**
4. Klik **Add script property**
5. Tambahkan properties berikut:

| Property             | Value               | Keterangan                     |
| -------------------- | ------------------- | ------------------------------ |
| `TELEGRAM_BOT_TOKEN` | `123456:ABC-DEF...` | Token dari @BotFather          |
| `OPENROUTER_API_KEY` | `sk-or-v1-...`      | API key dari OpenRouter        |
| `AI_MODEL`           | `auto`              | Model AI (bisa diganti manual) |
| `REVISION_TIMEOUT`   | `60000`             | Timeout revisi (ms)            |
| `MAX_FILE_SIZE`      | `10485760`          | Max file size (bytes)          |

### Via Code (One-time Setup):

Buat fungsi temporary di `Main.js`:

```javascript
function setupScriptProperties() {
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    TELEGRAM_BOT_TOKEN: "YOUR_BOT_TOKEN",
    OPENROUTER_API_KEY: "YOUR_OPENROUTER_KEY",
    AI_MODEL: "auto",
    REVISION_TIMEOUT: "60000",
    MAX_FILE_SIZE: "10485760",
  });
  Logger.log("✅ Script Properties set!");
}
```

Jalankan fungsi ini sekali dari editor, lalu hapus.

---

## Langkah 7: Test Dependencies

Di Apps Script Editor:

1. Pilih fungsi `testDependencies` dari dropdown
2. Klik **Run**
3. Authorize script (pertama kali)
4. Lihat logs (View > Logs)

Pastikan semua dependencies loaded dan API keys ter-set.

---

## Langkah 8: Deploy as Web App

1. Di Apps Script Editor, klik **Deploy** > **New deployment**
2. Pilih type: **Web app**
3. Konfigurasi:
   - **Description:** "Production v1" (atau sesuai keinginan)
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. Klik **Deploy**
5. Copy **Web App URL** (format: `https://script.google.com/macros/s/...`)

**PENTING:** Simpan URL ini! Anda akan memerlukannya untuk Cloudflare Worker.

---

## Langkah 9: Update Cloudflare Worker

Set Web App URL sebagai secret di Cloudflare Worker:

```bash
cd "d:/04 PROJECTS/PHOTO PROFILE 1.0/profile-picture-telegram-bot"
npx wrangler secret put GAS_WEB_APP_URL
```

Paste Web App URL yang Anda copy di langkah 8.

Deploy ulang worker:

```bash
npx wrangler deploy
```

---

## Langkah 10: Set Telegram Webhook

Ganti `<BOT_TOKEN>` dengan token bot Anda:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://profile-picture-telegram-bot.arenoe-studio.workers.dev"
```

Atau buka URL tersebut di browser.

Response yang benar:

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

---

## Langkah 11: Test Bot

1. Buka bot Anda di Telegram
2. Kirim `/start`
3. Bot harus membalas dengan welcome message
4. Kirim foto untuk test processing

---

## Update Code (Setelah Perubahan)

Setiap kali Anda edit code:

```bash
# Push changes
clasp push

# Jika ada perubahan major, deploy versi baru
clasp deploy
```

**Note:** Untuk Web App, Anda tidak perlu deploy ulang setiap kali push. Deployment otomatis menggunakan versi terbaru jika Anda pilih "Execute as: Me".

---

## Troubleshooting

### Error: "Script has not been enabled for the current user"

**Solusi:** Jalankan `testDependencies` dari editor untuk authorize script.

### Error: "Missing required environment variables"

**Solusi:** Pastikan semua Script Properties sudah di-set (Langkah 6).

### Bot tidak merespon

**Checklist:**

1. Webhook ter-set dengan benar? (cek dengan `getWebhookInfo`)
2. Cloudflare Worker running? (test dengan GET request)
3. GAS Web App URL benar?
4. Script Properties ter-set?
5. Lihat logs di Apps Script Editor (View > Executions)

### OpenRouter API Error

**Solusi:**

1. Pastikan API key valid
2. Cek quota/balance di OpenRouter dashboard
3. Pastikan model yang dipilih tersedia

---

## Monitoring & Logs

### View Execution Logs:

1. Buka Apps Script Editor
2. Klik **View** > **Executions**
3. Lihat logs untuk setiap webhook request

### View Cloudflare Worker Logs:

```bash
npx wrangler tail
```

---

## Security Best Practices

1. ✅ **Jangan commit `.clasp.json`** (sudah di `.gitignore`)
2. ✅ **Jangan hardcode API keys** (gunakan Script Properties)
3. ✅ **Set Web App access ke "Anyone"** (Telegram webhook butuh akses publik)
4. ✅ **Monitor execution logs** untuk aktivitas mencurigakan

---

## Useful Commands

```bash
# Push code
clasp push

# Pull code (download dari GAS)
clasp pull

# Open in browser
clasp open

# View logs (real-time)
clasp logs

# Deploy new version
clasp deploy

# List deployments
clasp deployments
```

---

## Next Steps

1. Test bot dengan berbagai skenario
2. Monitor error logs
3. Adjust AI parameters jika perlu (di `Config.js`)
4. Implement advanced features (face detection, rate limiting, dll)

---

## Support

Jika ada masalah, cek:

1. Execution logs di Apps Script
2. Cloudflare Worker logs (`wrangler tail`)
3. Telegram webhook info: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-01
