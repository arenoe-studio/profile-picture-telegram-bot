/**
 * ImageProcessor.js
 * Image processing utilities
 * 
 * Note: Google Apps Script doesn't support native image processing libraries like sharp.
 * For advanced image processing, we need to use external APIs.
 */

/**
 * Get image info (dimensions, format) from URL
 * This is a placeholder - in production, you might want to use an external API
 * or just accept the image as-is
 * 
 * @param {string} url - Image URL
 * @returns {Object} Image info {width, height, format}
 */
function getImageInfo(url) {
  try {
    const response = UrlFetchApp.fetch(url);
    const blob = response.getBlob();
    
    // Basic info we can get
    const contentType = blob.getContentType();
    const size = blob.getBytes().length;
    
    return {
      contentType: contentType,
      size: size,
      format: contentType.split('/')[1], // e.g., 'jpeg', 'png'
    };
  } catch (e) {
    logError('Failed to get image info', { url, error: e.message });
    return null;
  }
}

/**
 * Convert image URL to base64
 * @param {string} url - Image URL
 * @returns {string} Base64 encoded image
 */
function convertToBase64(url) {
  try {
    const response = UrlFetchApp.fetch(url);
    const blob = response.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    
    return base64;
  } catch (e) {
    logError('Failed to convert image to base64', { url, error: e.message });
    throw e;
  }
}

/**
 * Convert blob to base64
 * @param {Blob} blob - Image blob
 * @returns {string} Base64 encoded image
 */
function blobToBase64(blob) {
  try {
    const base64 = Utilities.base64Encode(blob.getBytes());
    return base64;
  } catch (e) {
    logError('Failed to convert blob to base64', { error: e.message });
    throw e;
  }
}

/**
 * Get data URL from image URL
 * @param {string} url - Image URL
 * @returns {string} Data URL (data:image/jpeg;base64,...)
 */
function getDataUrl(url) {
  try {
    const response = UrlFetchApp.fetch(url);
    const blob = response.getBlob();
    const contentType = blob.getContentType();
    const base64 = Utilities.base64Encode(blob.getBytes());
    
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    logError('Failed to get data URL', { url, error: e.message });
    throw e;
  }
}


