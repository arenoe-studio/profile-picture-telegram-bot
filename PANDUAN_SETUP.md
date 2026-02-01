# Panduan Setup Cloudflare Worker untuk Telegram Bot

## Apa itu Wrangler?

**Wrangler** adalah alat baris perintah (Command Line Interface/CLI) resmi dari Cloudflare. Alat ini digunakan untuk membuat, menguji, dan men-deploy (mengunggah) kode Cloudflare Workers Anda ke jaringan global Cloudflare. Anggap saja sebagai "jembatan" antara kode di komputer Anda dan server Cloudflare.

## Langkah 1: Persiapan

File-file yang diperlukan sudah dibuatkan di folder ini:

1.  `package.json` (Pengaturan dependensi/library)
2.  `wrangler.toml` (Konfigurasi proyek Cloudflare)
3.  `src/index.js` (Kode utama worker)

Pastikan Anda sudah menginstal **Node.js** di komputer Anda.

## Langkah 2: Instalasi Dependensi

Buka terminal (Command Prompt atau PowerShell) di folder proyek ini, lalu jalankan perintah berikut untuk mengunduh library yang dibutuhkan (termasuk wrangler):

```bash
npm install
```

## Langkah 3: Login ke Cloudflare

Sebelum bisa upload, Anda harus login ke akun Cloudflare Anda melalui Wrangler. Jalankan perintah:

```bash
npx wrangler login
```

Browser akan terbuka otomatis. Izinkan akses (Allow) pada halaman Cloudflare yang muncul.

## Langkah 4: Deploy (Upload) ke Cloudflare

Setelah login berhasil, upload kode worker Anda dengan perintah:

```bash
npx wrangler deploy
```

Setelah proses selesai, terminal akan menampilkan URL worker Anda. Contohnya: `https://telegram-bot-worker.nama-user.workers.dev`.
**Simpan URL ini.** Ini adalah alamat webhook Anda.

## Langkah 5: Menghubungkan Webhook ke Telegram

Agar Telegram mengirim pesan ke Worker ini, Anda perlu mendaftarkan URL tadi sebagai webhook. Set webhook bisa dilakukan lewat browser.

Ganti `<YOUR_BOT_TOKEN>` dengan token bot Anda dan `<WORKER_URL>` dengan URL yang didapat dari langkah 4.

**Format URL:**

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<WORKER_URL>
```

Copy dan paste URL tersebut (yang sudah diedit) ke browser Anda dan tekan Enter. Jika berhasil, akan muncul tulisan `"ok": true`.

## Integrasi dengan Google App Script (Opsional)

Jika tujuan Anda adalah meneruskan data ke Google App Script (GAS):

1.  Deploy script GAS Anda sebagai "Web App".
2.  Dapatkan URL Web App GAS.
3.  Edit file `src/index.js` di proyek ini, uncomment bagian fetch ke GAS, dan masukkan URL GAS Anda.
4.  Lakukan `npx wrangler deploy` lagi untuk update.

Sekarang, alurnya adalah:
Telegram -> Cloudflare Worker -> Google App Script.
