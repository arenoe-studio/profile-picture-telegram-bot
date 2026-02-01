/**
 * PhotoHandler.js
 * Handle photo messages
 */

/**
 * Handle photo message
 * @param {Object} message - Telegram message object
 */
function handlePhotoMessage(message) {
  const chatId = message.chat.id;
  const photo = message.photo[message.photo.length - 1]; // Get highest resolution
  
  logInfo('Handling photo message', { chatId, fileId: photo.file_id });
  
  // Get or create session
  let session = getOrCreateSession(chatId);
  
  // If user was in revision state, cancel it
  if (session.state === BOT_STATES.WAITING_REVISION) {
    logInfo('Canceling revision, processing new photo', { chatId });
  }
  
  // Update session state
  updateSessionState(chatId, BOT_STATES.PROCESSING);
  
  // Send processing message
  sendChatAction(chatId, 'upload_photo');
  sendMessage(chatId, '📸 Foto diterima! Sedang memproses...\n\nMohon tunggu ±30 detik.');
  
  try {
    // Get file info
    const fileInfo = getFile(photo.file_id);
    const fileUrl = getFileUrl(photo.file_id);
    
    logInfo('Photo file info', { fileSize: fileInfo.file_size, filePath: fileInfo.file_path });
    
    // Validate photo
    sendDebugMessage(chatId, 'Validating photo...', { 
      fileSize: fileInfo.file_size,
      mimeType: 'image/jpeg' 
    });

    const validation = validatePhoto(
      { 
        file_size: fileInfo.file_size, 
        mime_type: 'image/jpeg' // Telegram photos are always JPEG
      },
      fileUrl,
      chatId
    );
    
    if (!validation.valid) {
      sendDebugMessage(chatId, '❌ Validation failed', { error: validation.error });
      updateSessionState(chatId, BOT_STATES.ERROR);
      sendMessage(chatId, validation.error);
      return;
    }
    
    sendDebugMessage(chatId, '✅ Validation passed');

    // Update session with original photo
    session = getSession(chatId);
    session.originalPhoto = fileUrl;
    setSession(chatId, session);
    
    // Generate formal photo with default parameters
    sendDebugMessage(chatId, 'Processing with parameters:', session.currentPrompt);
    const generatedImageUrl = generateFormalPhoto(fileUrl, session.currentPrompt, chatId);
    
    // Update session with processed photo
    session.processedPhoto = generatedImageUrl;
    session.state = BOT_STATES.WAITING_REVISION;
    setSession(chatId, session);
    
    // Send result
    const caption = `✅ Foto formal Anda sudah jadi!\n\n` +
      `👔 Baju: ${session.currentPrompt.clothing_type} ${session.currentPrompt.clothing_color}\n` +
      `🎨 Background: ${session.currentPrompt.background_color}\n\n` +
      `💡 Ingin revisi? Kirim pesan dalam 60 detik.\n` +
      `Contoh: "Ganti background merah" atau "Ubah baju jadi kemeja hitam"\n\n` +
      `Atau kirim foto baru untuk memulai dari awal.`;
    
    sendPhoto(chatId, generatedImageUrl, caption);
    
    // Set revision timeout
    setRevisionTimeout(chatId);
    
  } catch (e) {
    logError('Failed to process photo', { chatId, error: e.message, stack: e.stack });
    updateSessionState(chatId, BOT_STATES.ERROR);
    
    // Send error message
    let errorMessage = getErrorMessage('AI_PROCESSING_ERROR');
    
    // Check for specific errors
    if (e.message.includes('timeout')) {
      errorMessage = getErrorMessage('TIMEOUT_ERROR');
    } else if (e.message.includes('API')) {
      errorMessage = getErrorMessage('AI_API_ERROR');
    }
    
    sendMessage(chatId, errorMessage);
  }
}
