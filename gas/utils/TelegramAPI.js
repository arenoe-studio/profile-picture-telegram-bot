/**
 * TelegramAPI.js
 * Wrapper for Telegram Bot API
 * 
 * Provides helper functions to interact with Telegram Bot API.
 */

/**
 * Get Telegram API URL
 * @param {string} method - API method name
 * @returns {string} Full API URL
 */
function getTelegramApiUrl(method) {
  return `${CONFIG.TELEGRAM_API_BASE}${CONFIG.TELEGRAM_BOT_TOKEN}/${method}`;
}

/**
 * Make a request to Telegram API
 * @param {string} method - API method name
 * @param {Object} params - Request parameters
 * @returns {Object} API response
 */
function telegramApiRequest(method, params = {}) {
  const url = getTelegramApiUrl(method);
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(params),
    muteHttpExceptions: true,
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (!result.ok) {
      logError('Telegram API error', { method, error: result });
      throw new Error(`Telegram API error: ${result.description}`);
    }
    
    return result.result;
  } catch (e) {
    logError('Telegram API request failed', { method, error: e.message });
    throw e;
  }
}

/**
 * Send text message to user
 * @param {number} chatId - Chat ID
 * @param {string} text - Message text
 * @param {Object} options - Additional options (reply_markup, parse_mode, etc.)
 * @returns {Object} Sent message
 */
function sendMessage(chatId, text, options = {}) {
  const params = {
    chat_id: chatId,
    text: text,
    ...options,
  };
  
  logInfo('Sending message', { chatId, textLength: text.length });
  return telegramApiRequest('sendMessage', params);
}

/**
 * Send photo to user
 * @param {number} chatId - Chat ID
 * @param {string|Blob} photo - Photo URL or Blob object
 * @param {string} caption - Photo caption (optional)
 * @param {Object} options - Additional options
 * @returns {Object} Sent message
 */
function sendPhoto(chatId, photo, caption = '', options = {}) {
  const url = getTelegramApiUrl('sendPhoto');
  
  // If photo is string (URL), use JSON payload
  if (typeof photo === 'string') {
    const params = {
      chat_id: chatId,
      photo: photo,
      caption: caption,
      ...options,
    };
    logInfo('Sending photo (URL)', { chatId, photo });
    return telegramApiRequest('sendPhoto', params);
  } 
  
  // If photo is Blob, use multipart
  // Note: telegramApiRequest helper uses JSON contentType, so we need direct call here
  const payload = {
    chat_id: chatId.toString(), // Ensure string for multipart
    photo: photo,
    caption: caption || '',
    ...options
  };
  
  const reqOptions = {
    method: 'post',
    payload: payload,
    muteHttpExceptions: true
  };
  
  logInfo('Sending photo (Blob)', { chatId, size: photo.getBytes().length });
  
  try {
    const response = UrlFetchApp.fetch(url, reqOptions);
    const result = JSON.parse(response.getContentText());
    
    if (!result.ok) {
      logError('Telegram API error (multiform)', { error: result });
      throw new Error(`Telegram API error: ${result.description}`);
    }
    
    return result.result;
  } catch (e) {
    logError('Telegram API request failed (multiform)', { error: e.message });
    throw e;
  }
}

/**
 * Send chat action (typing, upload_photo, etc.)
 * @param {number} chatId - Chat ID
 * @param {string} action - Action type
 */
function sendChatAction(chatId, action) {
  const params = {
    chat_id: chatId,
    action: action,
  };
  
  return telegramApiRequest('sendChatAction', params);
}

/**
 * Get file info from Telegram
 * @param {string} fileId - File ID
 * @returns {Object} File info
 */
function getFile(fileId) {
  const params = { file_id: fileId };
  return telegramApiRequest('getFile', params);
}

/**
 * Download file from Telegram servers
 * @param {string} filePath - File path from getFile
 * @returns {Blob} File blob
 */
function downloadFile(filePath) {
  const url = `https://api.telegram.org/file/bot${CONFIG.TELEGRAM_BOT_TOKEN}/${filePath}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    return response.getBlob();
  } catch (e) {
    logError('Failed to download file', { filePath, error: e.message });
    throw new Error(getErrorMessage('FILE_DOWNLOAD_FAILED'));
  }
}

/**
 * Get file URL from Telegram
 * @param {string} fileId - File ID
 * @returns {string} File URL
 */
function getFileUrl(fileId) {
  const fileInfo = getFile(fileId);
  return `https://api.telegram.org/file/bot${CONFIG.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;
}

/**
 * Answer callback query (for inline buttons)
 * @param {string} callbackQueryId - Callback query ID
 * @param {string} text - Text to show (optional)
 * @param {boolean} showAlert - Show as alert (optional)
 */
function answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
  const params = {
    callback_query_id: callbackQueryId,
    text: text,
    show_alert: showAlert,
  };
  
  return telegramApiRequest('answerCallbackQuery', params);
}

/**
 * Send debug message to user if DEBUG_MODE is enabled
 * @param {number} chatId - Chat ID
 * @param {string} message - Debug message
 * @param {Object} data - Optional data to stringify
 */
function sendDebugMessage(chatId, message, data = null) {
  if (!CONFIG.DEBUG_MODE) return;
  
  let text = `🛠 <b>DEBUG:</b> ${message}`;
  
  if (data) {
    let jsonStr = '';
    try {
      jsonStr = JSON.stringify(data, null, 2);
      // Truncate if too long (Telegram limit 4096 chars)
      if (jsonStr.length > 3500) {
        jsonStr = jsonStr.substring(0, 3500) + '... (truncated)';
      }
    } catch (e) {
      jsonStr = '[Circular or Invalid JSON]';
    }
    text += `\n<pre language="json">${jsonStr}</pre>`;
  }
  
  // Use simple sendMessage but don't fail if debug fails
  try {
    const params = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_notification: true
    };
    telegramApiRequest('sendMessage', params);
  } catch (e) {
    Logger.log('Failed to send debug message: ' + e.message);
  }
}
