/**
 * Config.js
 * Centralized configuration and environment variables management
 * 
 * All sensitive data (API keys, tokens) are stored in Script Properties.
 * Set them via: Project Settings > Script Properties in Apps Script Editor
 * Or programmatically using PropertiesService.getScriptProperties().setProperty()
 */

/**
 * Get environment variable from Script Properties
 * @param {string} key - Property key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} Property value
 */
function getEnv(key, defaultValue = '') {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty(key) || defaultValue;
}

/**
 * Validate that all required environment variables are set
 * @throws {Error} If required variables are missing
 */
function validateConfig() {
  const required = ['TELEGRAM_BOT_TOKEN', 'OPENROUTER_API_KEY'];
  const missing = required.filter(key => !getEnv(key));
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const CONFIG = {
  // Telegram Bot Configuration
  TELEGRAM_BOT_TOKEN: getEnv('TELEGRAM_BOT_TOKEN'),
  TELEGRAM_API_BASE: 'https://api.telegram.org/bot',
  
  // AI Service Configuration (OpenRouter / Replicate)
  // Saat ini dikonfigurasi untuk OpenRouter. 
  // Jika ingin menggunakan Replicate, ubah URL dan Key.
  OPENROUTER_API_KEY: getEnv('OPENROUTER_API_KEY'),
  OPENROUTER_API_BASE: 'https://openrouter.ai/api/v1',
  AI_MODEL: getEnv('AI_MODEL', 'google/imagen-3'), // Placeholder model 
  
  // Bot Behavior
  REVISION_TIMEOUT: parseInt(getEnv('REVISION_TIMEOUT', '60000')), // 60 seconds
  MAX_FILE_SIZE: parseInt(getEnv('MAX_FILE_SIZE', '10485760')), // 10MB
  
  // Session Management
  CACHE_EXPIRATION: 21600, // 6 hours (max for CacheService)
  
  // Optional Features
  FACE_DETECTION_ENABLED: getEnv('FACE_DETECTION_ENABLED', 'false') === 'true',
  
  // Development
  DEBUG_MODE: getEnv('DEBUG_MODE', 'false') === 'true', // Default false for production
};

// ============================================================================
// AI PARAMETERS (Based on PROJECT_REQUIREMENTS.md)
// ============================================================================

const AI_PARAMS = {
  // Core Parameters - DO NOT CHANGE
  temperature: 0.05,              // Minimal hallucination
  guidance_scale: 7.5,            // Strong prompt adherence
  num_inference_steps: 50,        // Quality vs speed balance
  
  // Image-to-Image Settings
  strength: 0.35,                 // Denoising strength (low = preserve more)
  
  // Output Settings
  output_format: 'jpg',
  output_quality: 95,
  
  // Default Dimensions
  width: 768,
  height: 1024,
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

const VALIDATION_RULES = {
  // File validation
  MAX_FILE_SIZE: CONFIG.MAX_FILE_SIZE,
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  MIN_DIMENSION: 512,
  
  // Face detection (if enabled)
  MIN_FACES: 1,
  MAX_FACES: 1,
};

// ============================================================================
// DEFAULT PROMPT PARAMETERS
// ============================================================================

const DEFAULT_PARAMS = {
  clothing_type: 'formal shirt',
  clothing_color: 'white',
  background_color: 'blue',
};

// ============================================================================
// BOT STATES
// ============================================================================

const BOT_STATES = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  WAITING_REVISION: 'waiting_revision',
  ERROR: 'error',
};

// ============================================================================
// RATE LIMITING
// ============================================================================

const RATE_LIMIT = {
  MAX_REQUESTS_PER_USER: 10,      // Max 10 photos per user per hour
  WINDOW_MS: 3600000,             // 1 hour
};
