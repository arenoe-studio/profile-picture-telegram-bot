/**
 * AIService.js
 * OpenRouter API integration for AI image generation
 * 
 * Handles image-to-image transformation using OpenRouter API.
 */

/**
 * Generate formal photo using OpenRouter API
 * @param {string} imageUrl - Original photo URL
 * @param {Object} params - Prompt parameters
 * @param {number} chatId - Chat ID (optional, for debug logging)
 * @returns {string} Generated image URL
 */
function generateFormalPhoto(imageUrl, params, chatId = null) {
  try {
    logInfo('Starting AI generation', { imageUrl, params });
    if (chatId) sendDebugMessage(chatId, 'Starting AI generation...', params);
    
    // Build prompts
    const promptConfig = buildPromptConfig(params);
    if (chatId) sendDebugMessage(chatId, 'Built Prompts', promptConfig);
    
    // Convert image to base64
    const imageBase64 = convertToBase64(imageUrl);
    if (chatId) sendDebugMessage(chatId, 'Image converted to Base64');
    
    // Prepare request payload
    const payload = {
      model: CONFIG.AI_MODEL,
      prompt: promptConfig.prompt,
      negative_prompt: promptConfig.negative_prompt,
      
      // Image input (base64)
      image: imageBase64,
      
      // AI parameters from config
      guidance_scale: AI_PARAMS.guidance_scale,
      num_inference_steps: AI_PARAMS.num_inference_steps,
      strength: AI_PARAMS.strength,
      
      // Output settings
      width: AI_PARAMS.width,
      height: AI_PARAMS.height,
      output_format: AI_PARAMS.output_format,
      output_quality: AI_PARAMS.output_quality,
    };
    
    // Make API request
    if (chatId) sendDebugMessage(chatId, `Calling OpenRouter (${CONFIG.AI_MODEL})...`);
    const response = callOpenRouterAPI(payload);
    
    // Extract generated image URL
    const generatedImageUrl = extractImageUrl(response);
    
    logInfo('AI generation completed', { generatedImageUrl });
    if (chatId) sendDebugMessage(chatId, 'AI Generation success', { url: generatedImageUrl });
    
    return generatedImageUrl;
    
  } catch (e) {
    logError('AI generation failed', { error: e.message, stack: e.stack });
    if (chatId) sendDebugMessage(chatId, '❌ AI Generation Failed', { error: e.message });
    throw new Error(getErrorMessage('AI_PROCESSING_ERROR'));
  }
}

/**
 * Call OpenRouter API
 * @param {Object} payload - Request payload
 * @returns {Object} API response
 */
function callOpenRouterAPI(payload) {
  const url = `${CONFIG.OPENROUTER_API_BASE}/generation`;
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://telegram-bot.example.com', // Optional: your site URL
      'X-Title': 'Telegram Formal Photo Bot', // Optional: your app name
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  
  try {
    logInfo('Calling OpenRouter API', { model: payload.model });
    
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logInfo('OpenRouter API response', { statusCode, responseLength: responseText.length });
    
    if (statusCode !== 200) {
      logError('OpenRouter API error', { statusCode, response: responseText });
      throw new Error(getErrorMessage('AI_API_ERROR'));
    }
    
    return JSON.parse(responseText);
    
  } catch (e) {
    logError('OpenRouter API request failed', { error: e.message });
    throw new Error(getErrorMessage('AI_API_ERROR'));
  }
}

/**
 * Extract image URL from OpenRouter response
 * Note: The exact response format depends on OpenRouter's API.
 * This is a generic implementation that may need adjustment.
 * 
 * @param {Object} response - API response
 * @returns {string} Image URL
 */
function extractImageUrl(response) {
  // OpenRouter response format may vary by model
  // Common formats:
  // 1. { output: "https://..." }
  // 2. { output: ["https://..."] }
  // 3. { data: [{ url: "https://..." }] }
  // 4. { images: ["base64..."] }
  
  if (response.output) {
    if (typeof response.output === 'string') {
      return response.output;
    } else if (Array.isArray(response.output) && response.output.length > 0) {
      return response.output[0];
    }
  }
  
  if (response.data && Array.isArray(response.data) && response.data.length > 0) {
    if (response.data[0].url) {
      return response.data[0].url;
    }
  }
  
  if (response.images && Array.isArray(response.images) && response.images.length > 0) {
    // If base64, we need to upload it somewhere
    // For now, assume it's a URL
    return response.images[0];
  }
  
  logError('Could not extract image URL from response', { response });
  throw new Error('Invalid API response format');
}

/**
 * Upload base64 image to temporary storage
 * This is needed if OpenRouter returns base64 instead of URL
 * 
 * Options:
 * - ImgBB (free, simple)
 * - Cloudinary (free tier available)
 * - Telegraph (Telegram's image hosting)
 * 
 * @param {string} base64 - Base64 image data
 * @returns {string} Uploaded image URL
 */
function uploadBase64Image(base64) {
  // TODO: Implement image upload to temporary storage
  // For now, throw error
  throw new Error('Base64 image upload not implemented. Please configure image hosting.');
}

