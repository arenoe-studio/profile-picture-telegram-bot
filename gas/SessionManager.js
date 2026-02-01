/**
 * SessionManager.js
 * Manage user sessions using CacheService
 * 
 * Session data is stored in CacheService with max 6 hours retention.
 * Each user has their own session with state, photos, and prompt parameters.
 */

/**
 * Get session key for a user
 * @param {number} userId - Telegram user ID
 * @returns {string} Cache key
 */
function getSessionKey(userId) {
  return `session_${userId}`;
}

/**
 * Get user session from cache
 * @param {number} userId - Telegram user ID
 * @returns {Object|null} Session data or null if not found
 */
function getSession(userId) {
  const cache = CacheService.getScriptCache();
  const key = getSessionKey(userId);
  const data = cache.get(key);
  
  if (!data) {
    return null;
  }
  
  try {
    return JSON.parse(data);
  } catch (e) {
    logError('Failed to parse session data', { userId, error: e.message });
    return null;
  }
}

/**
 * Create a new session for a user
 * @param {number} userId - Telegram user ID
 * @returns {Object} New session data
 */
function createSession(userId) {
  const session = {
    userId: userId,
    state: BOT_STATES.IDLE,
    originalPhoto: null,
    processedPhoto: null,
    currentPrompt: {
      clothing_type: DEFAULT_PARAMS.clothing_type,
      clothing_color: DEFAULT_PARAMS.clothing_color,
      background_color: DEFAULT_PARAMS.background_color,
    },
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };
  
  setSession(userId, session);
  return session;
}

/**
 * Update user session
 * @param {number} userId - Telegram user ID
 * @param {Object} data - Session data to update
 */
function setSession(userId, data) {
  const cache = CacheService.getScriptCache();
  const key = getSessionKey(userId);
  
  // Update lastActivity
  data.lastActivity = new Date().toISOString();
  
  // Store in cache (max 6 hours)
  cache.put(key, JSON.stringify(data), CONFIG.CACHE_EXPIRATION);
}

/**
 * Update session state
 * @param {number} userId - Telegram user ID
 * @param {string} state - New state
 */
function updateSessionState(userId, state) {
  const session = getSession(userId) || createSession(userId);
  session.state = state;
  setSession(userId, session);
}

/**
 * Update session prompt parameters
 * @param {number} userId - Telegram user ID
 * @param {Object} params - Prompt parameters to update
 */
function updateSessionPrompt(userId, params) {
  const session = getSession(userId);
  if (!session) {
    logWarn('Cannot update prompt: session not found', { userId });
    return;
  }
  
  session.currentPrompt = {
    ...session.currentPrompt,
    ...params,
  };
  
  setSession(userId, session);
}

/**
 * Reset user session
 * @param {number} userId - Telegram user ID
 */
function resetSession(userId) {
  const cache = CacheService.getScriptCache();
  const key = getSessionKey(userId);
  cache.remove(key);
  
  logInfo('Session reset', { userId });
}

/**
 * Get or create session
 * @param {number} userId - Telegram user ID
 * @returns {Object} Session data
 */
function getOrCreateSession(userId) {
  let session = getSession(userId);
  if (!session) {
    session = createSession(userId);
  }
  return session;
}

/**
 * Set revision timeout for a user
 * This is handled via time-based triggers in GAS
 * We store the timeout timestamp in the session
 * 
 * @param {number} userId - Telegram user ID
 */
function setRevisionTimeout(userId) {
  const session = getSession(userId);
  if (!session) {
    return;
  }
  
  // Store timeout timestamp
  const timeoutAt = new Date(Date.now() + CONFIG.REVISION_TIMEOUT).toISOString();
  session.revisionTimeoutAt = timeoutAt;
  setSession(userId, session);
  
  logInfo('Revision timeout set', { userId, timeoutAt });
}

/**
 * Check if revision timeout has expired
 * @param {number} userId - Telegram user ID
 * @returns {boolean} True if timeout expired
 */
function isRevisionTimeoutExpired(userId) {
  const session = getSession(userId);
  if (!session || !session.revisionTimeoutAt) {
    return false;
  }
  
  const now = new Date();
  const timeoutAt = new Date(session.revisionTimeoutAt);
  
  return now > timeoutAt;
}
