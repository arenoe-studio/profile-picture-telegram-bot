/**
 * CommandHandler.js
 * Handle bot commands (/start, /help, /cancel)
 */

/**
 * Handle /start command
 * @param {Object} message - Telegram message object
 */
function handleStartCommand(message) {
  const chatId = message.chat.id;
  const firstName = message.from.first_name || 'User';
  
  const welcomeText = `👋 Halo ${firstName}!

Selamat datang di **Formal Photo Bot**! 📸

Bot ini akan mengubah foto casual Anda menjadi foto formal profesional menggunakan AI.

🎯 **Cara Pakai:**
1. Kirim foto Anda (background dan baju harus polos)
2. Bot akan memproses dan mengirim hasil foto formal
3. Jika ingin revisi, kirim pesan seperti:
   • "Ganti background merah"
   • "Ubah baju jadi kemeja hitam"
   • "Background putih baju biru"

⚙️ **Default Setting:**
• Baju: Kemeja putih
• Background: Biru

📋 Ketik /help untuk panduan lengkap.

Silakan kirim foto Anda untuk memulai! 🚀`;

  sendMessage(chatId, welcomeText);
  
  // Reset session
  resetSession(chatId);
}

/**
 * Handle /help command
 * @param {Object} message - Telegram message object
 */
function handleHelpCommand(message) {
  const chatId = message.chat.id;
  
  const helpText = `📖 **Panduan Lengkap Formal Photo Bot**

🎯 **Cara Menggunakan:**

1️⃣ **Kirim Foto**
   • Kirim foto Anda ke bot
   • Pastikan background polos (merah, biru, putih, dll)
   • Pastikan baju polos tanpa motif
   • Wajah harus terlihat jelas

2️⃣ **Terima Hasil**
   • Bot akan memproses foto (±30 detik)
   • Anda akan menerima foto formal

3️⃣ **Revisi (Opsional)**
   • Dalam 60 detik, Anda bisa kirim revisi
   • Contoh pesan revisi:
     - "Ganti background merah"
     - "Ubah baju jadi kaos hitam"
     - "Background putih baju biru"
     - "Pake kemeja abu-abu"

🎨 **Pilihan Warna:**
• Merah, Biru, Putih, Hitam, Abu-abu
• Hijau, Kuning, Coklat, Pink, Ungu, Orange

👔 **Pilihan Baju:**
• Kemeja/Hem (formal)
• Kaos (casual)
• Polo
• Jas/Blazer

⚠️ **Persyaratan Foto:**
• Format: JPG, PNG, WEBP
• Ukuran max: 10MB
• Resolusi min: 512x512px
• 1 wajah saja dalam foto

❓ **Perintah Bot:**
• /start - Mulai dari awal
• /help - Lihat panduan ini
• /cancel - Batalkan revisi

💡 **Tips:**
• Gunakan foto dengan pencahayaan baik
• Wajah menghadap kamera
• Background dan baju polos untuk hasil terbaik

Selamat mencoba! 🎉`;

  sendMessage(chatId, helpText);
}

/**
 * Handle /cancel command
 * @param {Object} message - Telegram message object
 */
function handleCancelCommand(message) {
  const chatId = message.chat.id;
  const session = getSession(chatId);
  
  if (!session || session.state === BOT_STATES.IDLE) {
    sendMessage(chatId, '✅ Tidak ada sesi aktif untuk dibatalkan.\n\nSilakan kirim foto untuk memulai.');
    return;
  }
  
  // Reset session
  resetSession(chatId);
  
  sendMessage(chatId, '✅ Sesi dibatalkan.\n\nSilakan kirim foto baru untuk memulai.');
}

/**
 * Route command to appropriate handler
 * @param {Object} message - Telegram message object
 */
function handleCommand(message) {
  const command = message.text.split(' ')[0].toLowerCase();
  
  logInfo('Handling command', { command, chatId: message.chat.id });
  
  switch (command) {
    case '/start':
      handleStartCommand(message);
      break;
    
    case '/help':
      handleHelpCommand(message);
      break;
    
    case '/cancel':
      handleCancelCommand(message);
      break;
    
    default:
      sendMessage(message.chat.id, '❓ Perintah tidak dikenal. Ketik /help untuk bantuan.');
  }
}
