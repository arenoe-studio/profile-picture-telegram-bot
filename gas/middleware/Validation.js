/**
 * Validation.js
 * Validation middleware for photo processing
 * 
 * Validates file size, format, and optionally background/clothing/face detection.
 */

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @returns {Object} {valid: boolean, error: string}
 */
function validateFileSize(fileSize) {
  if (!VALIDATION_RULES) {
    logError('VALIDATION_RULES not defined');
    return { valid: false, error: 'Internal Configuration Error' };
  }
  
  if (fileSize > VALIDATION_RULES.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: getErrorMessage('FILE_TOO_LARGE'),
    };
  }
  
  return { valid: true };
}

/**
 * Validate file format
 * @param {string} mimeType - MIME type
 * @returns {Object} {valid: boolean, error: string}
 */
function validateFileFormat(mimeType) {
  if (!VALIDATION_RULES.ALLOWED_FORMATS.includes(mimeType)) {
    return {
      valid: false,
      error: getErrorMessage('UNSUPPORTED_FORMAT'),
    };
  }
  
  return { valid: true };
}

/**
 * Validate image dimensions
 * @param {string} imageUrl - Image URL
 * @returns {Object} {valid: boolean, error: string}
 */
function validateImageDimensions(imageUrl) {
  // Skip for now - GAS limitation
  // In production, use external API like Google Vision
  return { valid: true };
}

/**
 * Validate solid background
 * This requires external API (e.g., Google Vision API, Cloudinary)
 * For MVP, we'll skip this validation
 * 
 * @param {string} imageUrl - Image URL
 * @returns {Object} {valid: boolean, error: string}
 */
function validateSolidBackground(imageUrl) {
  // TODO: Implement with external API
  // For now, skip validation
  logWarn('Background validation skipped (not implemented)');
  return { valid: true };
}

/**
 * Validate solid clothing
 * This requires external API
 * For MVP, we'll skip this validation
 * 
 * @param {string} imageUrl - Image URL
 * @returns {Object} {valid: boolean, error: string}
 */
function validateSolidClothing(imageUrl) {
  // TODO: Implement with external API
  // For now, skip validation
  logWarn('Clothing validation skipped (not implemented)');
  return { valid: true };
}

/**
 * Validate face count
 * This requires external API (e.g., Google Vision API)
 * For MVP, we'll skip this validation
 * 
 * @param {string} imageUrl - Image URL
 * @returns {Object} {valid: boolean, error: string}
 */
function validateFaceCount(imageUrl) {
  // Only validate if enabled in config
  if (!CONFIG.FACE_DETECTION_ENABLED) {
    logInfo('Face detection disabled, skipping validation');
    return { valid: true };
  }
  
  // TODO: Implement with Google Vision API or similar
  // For now, skip validation
  logWarn('Face detection validation skipped (not implemented)');
  return { valid: true };
}

/**
 * Validate photo before processing
 * Runs all validation checks
 * 
 * @param {Object} fileInfo - File info {file_size, mime_type}
 * @param {string} imageUrl - Image URL
 * @returns {Object} {valid: boolean, error: string}
 */
function validatePhoto(fileInfo, imageUrl, chatId = null) {
  // Debug global config
  if (chatId) {
    sendDebugMessage(chatId, 'Debug Config Validation', { 
      rules_defined: typeof VALIDATION_RULES !== 'undefined',
      max_size: VALIDATION_RULES ? VALIDATION_RULES.MAX_FILE_SIZE : 'undefined',
      allowed_formats: VALIDATION_RULES ? VALIDATION_RULES.ALLOWED_FORMATS : 'undefined'
    });
  }

  logInfo('Validating photo input', fileInfo);
  
  if (!VALIDATION_RULES) {
     return { valid: false, error: 'Internal Error: Configuration not loaded' };
  }

  // Validate file size
  if (chatId) sendDebugMessage(chatId, 'Checking File Size', { size: fileInfo.file_size, max: VALIDATION_RULES.MAX_FILE_SIZE });
  const sizeCheck = validateFileSize(fileInfo.file_size);
  if (!sizeCheck.valid) {
    if (chatId) sendDebugMessage(chatId, '❌ Size Check Failed', sizeCheck);
    return sizeCheck;
  }
  
  // Validate file format
  if (chatId) sendDebugMessage(chatId, 'Checking Format', { type: fileInfo.mime_type, allowed: VALIDATION_RULES.ALLOWED_FORMATS });
  const formatCheck = validateFileFormat(fileInfo.mime_type);
  if (!formatCheck.valid) {
    if (chatId) sendDebugMessage(chatId, '❌ Format Check Failed', formatCheck);
    return formatCheck;
  }
  
  // Validate dimensions
  if (chatId) sendDebugMessage(chatId, 'Checking Dimensions', { url: imageUrl ? 'Present' : 'Missing' });
  const dimensionCheck = validateImageDimensions(imageUrl);
  if (chatId) sendDebugMessage(chatId, 'Dimension Check Result', dimensionCheck);

  if (!dimensionCheck.valid) {
    if (chatId) sendDebugMessage(chatId, '❌ Dimension Check Failed', dimensionCheck);
    return dimensionCheck;
  }
  
  if (chatId) sendDebugMessage(chatId, '✅ All Validations Passed');
  return { valid: true };
}
