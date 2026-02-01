/**
 * TextHandler.js
 * Handle text messages (revision requests)
 */

/**
 * Handle text message (revision request)
 * @param {Object} message - Telegram message object
 */
function handleTextMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  
  logInfo('Handling text message', { chatId, text });
  
  // Get session
  const session = getSession(chatId);
  
  // Check if user is in revision state
  if (!session || session.state !== BOT_STATES.WAITING_REVISION) {
    sendMessage(chatId, '❓ Silakan kirim foto terlebih dahulu.\n\nKetik /help untuk panduan.');
    return;
  }
  
  // Check if revision timeout expired
  if (isRevisionTimeoutExpired(chatId)) {
    resetSession(chatId);
    sendMessage(chatId, getErrorMessage('SESSION_EXPIRED'));
    return;
  }
  
  // Parse revision request
  const updates = parseRevision(text);
  sendDebugMessage(chatId, 'Parsed revision', updates);
  
  if (!isValidRevision(updates)) {
    sendMessage(chatId, '❓ Tidak dapat memahami permintaan revisi.\n\n' +
      'Contoh:\n' +
      '• "Ganti background merah"\n' +
      '• "Ubah baju jadi kemeja hitam"\n' +
      '• "Background putih baju biru"');
    return;
  }
  
  // Update session with new parameters
  updateSessionPrompt(chatId, updates);
  updateSessionState(chatId, BOT_STATES.PROCESSING);
  
  // Send processing message
  sendChatAction(chatId, 'upload_photo');
  sendMessage(chatId, '🔄 Memproses revisi Anda...\n\nMohon tunggu sebentar.');
  
  // Process photo with new parameters
  try {
    const updatedSession = getSession(chatId);
    const originalPhotoUrl = updatedSession.originalPhoto;
    const newParams = updatedSession.currentPrompt;
    
    sendDebugMessage(chatId, 'Re-generating with new parameters', newParams);

    // Generate new formal photo
    const generatedImageUrl = generateFormalPhoto(originalPhotoUrl, newParams, chatId);
    
    // Update session
    updatedSession.processedPhoto = generatedImageUrl;
    updatedSession.state = BOT_STATES.WAITING_REVISION;
    setSession(chatId, updatedSession);
    
    // Send result
    const caption = `✅ Foto formal Anda (revisi):\n\n` +
      `👔 Baju: ${newParams.clothing_type} ${newParams.clothing_color}\n` +
      `🎨 Background: ${newParams.background_color}\n\n` +
      `Ingin revisi lagi? Kirim pesan dalam 60 detik.\n` +
      `Atau kirim foto baru untuk memulai dari awal.`;
    
    sendPhoto(chatId, generatedImageUrl, caption);
    
    // Set new timeout
    setRevisionTimeout(chatId);
    
  } catch (e) {
    logError('Failed to process revision', { chatId, error: e.message });
    updateSessionState(chatId, BOT_STATES.ERROR);
    sendMessage(chatId, getErrorMessage('AI_PROCESSING_ERROR'));
  }
}
