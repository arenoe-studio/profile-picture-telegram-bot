/**
 * ErrorMessages.js
 * Centralized error messages in Indonesian
 */

const ERROR_MESSAGES = {
  // Validation Errors
  VALIDATION_FAILED_BG: '❌ Background harus warna polos (merah, biru, putih, dll). Coba lagi dengan foto yang backgroundnya polos.',
  
  VALIDATION_FAILED_CLOTHING: '❌ Baju harus polos tanpa motif atau logo. Coba lagi dengan foto yang bajunya polos.',
  
  NO_FACE_DETECTED: '❌ Tidak terdeteksi wajah dalam foto. Pastikan wajah terlihat jelas.',
  
  MULTIPLE_FACES: '❌ Terdeteksi lebih dari 1 wajah. Gunakan foto dengan 1 orang saja.',
  
  // File Errors
  FILE_TOO_LARGE: '❌ Ukuran file terlalu besar (max 10MB). Kompres foto terlebih dahulu.',
  
  UNSUPPORTED_FORMAT: '❌ Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.',
  
  FILE_DOWNLOAD_FAILED: '❌ Gagal mengunduh foto. Silakan coba lagi.',
  
  // Processing Errors
  AI_PROCESSING_ERROR: '❌ Terjadi kesalahan saat memproses foto. Silakan coba lagi.',
  
  AI_API_ERROR: '❌ Layanan AI sedang sibuk. Silakan coba lagi dalam beberapa saat.',
  
  TIMEOUT_ERROR: '❌ Proses terlalu lama. Silakan coba lagi.',
  
  // Configuration Errors
  CONFIG_ERROR: '❌ Bot belum dikonfigurasi dengan benar. Hubungi administrator.',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: '❌ Anda telah mencapai batas maksimal (10 foto per jam). Silakan coba lagi nanti.',
  
  // Session Errors
  SESSION_EXPIRED: '⏱ Waktu revisi habis. Silakan kirim foto baru.',
  
  NO_ACTIVE_SESSION: '❌ Tidak ada sesi aktif. Silakan kirim foto terlebih dahulu.',
  
  // General Errors
  UNKNOWN_ERROR: '❌ Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.',
};

/**
 * Get error message by key
 * @param {string} key - Error message key
 * @returns {string} Error message
 */
function getErrorMessage(key) {
  return ERROR_MESSAGES[key] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Format error message with context
 * @param {string} key - Error message key
 * @param {Object} context - Additional context
 * @returns {string} Formatted error message
 */
function formatErrorMessage(key, context = {}) {
  let message = getErrorMessage(key);
  
  // Replace placeholders if any
  Object.keys(context).forEach(k => {
    message = message.replace(`{${k}}`, context[k]);
  });
  
  return message;
}
