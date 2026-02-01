# Telegram Formal Photo Bot 📸

Bot Telegram canggih untuk mengubah foto santai menjadi pas foto formal profesional menggunakan AI.

![Banner](https://via.placeholder.com/1200x600.png?text=Telegram+Formal+Photo+Bot)

## ✨ Fitur Utama

- **Transformasi AI Instan**: Mengubah baju santai menjadi kemeja/jas formal.
- **Ganti Background**: Otomatis mengganti background menjadi warna pilihan (Merah/Biru/Putih).
- **Revisi Natural**: Chat dengan bot untuk revisi, misal: _"Ganti background merah"_ atau _"Pake jas hitam"_.
- **Tanpa Install Aplikasi**: Berjalan sepenuhnya di Telegram.
- **Privasi**: Foto diproses sementara dan tidak disimpan permanen.

## 🛠 Teknologi

Project ini dibangun dengan arsitektur serverless yang hemat biaya dan scalable:

- **Cloudflare Workers**: Menangani webhook Telegram dengan latensi rendah.
- **Google Apps Script (GAS)**: Backend logic dan manajemen sesi.
- **AI Integration**: Siap terhubung dengan OpenRouter, Replicate, atau HuggingFace API.
- **Telegram Bot API**: Interface pengguna.

## 🚀 Persiapan Deployment

### 1. Prasyarat

- Node.js & NPM
- Akun Google (untuk Apps Script)
- Akun Cloudflare (Free tier cukup)
- Telegram Bot Token (dari @BotFather)
- **AI API Key** (OpenRouter / Replicate / HuggingFace) - _Saat ini disetup untuk OpenRouter_

### 2. Setup Cloudflare Worker

```bash
# Login ke Cloudflare
npx wrangler login

# Set Environment Variables
npx wrangler secret put GAS_WEB_APP_URL    # URL dari langkah setup GAS
npx wrangler secret put TELEGRAM_BOT_TOKEN # Token bot Anda

# Deploy
npx wrangler deploy
```

### 3. Setup Google Apps Script

```bash
# Install Clasp
npm install -g @google/clasp

# Login & Clone
clasp login
clasp create --type webapp --title "Formal Photo Bot" --rootDir ./gas

# Push Code
clasp push

# Set Script Properties (di Project Settings):
# - TELEGRAM_BOT_TOKEN
# - OPENROUTER_API_KEY
# - AI_MODEL (contoh: google/imagen-3 atau stabilityai/stable-diffusion-xl)
```

### 4. Aktivasi Webhook

Jalankan perintah curl untuk menghubungkan Bot Telegram ke Cloudflare Worker:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WORKER_URL>"
```

## 📝 Catatan Penting tentang API AI

Saat ini project dikonfigurasi untuk menggunakan **OpenRouter API**. Layanan AI gratis (seperti HuggingFace Free Tier) saat ini membatasi akses API publik, sehingga disarankan menggunakan layanan berbayar (pay-per-use) seperti:

- **Replicate** (rekomendasi untuk kualitas terbaik)
- **OpenRouter**
- **OpenAI DALL-E 3**

Jika menggunakan Free Tier, Anda mungkin mengalami error `404/410 Not Found` karena perubahan kebijakan provider.

## 🤝 Kontribusi

Silakan fork repository ini dan kirim Pull Request jika Anda ingin menambahkan fitur baru!

## 📄 Lisensi

MIT License - Bebas digunakan dan dimodifikasi.
