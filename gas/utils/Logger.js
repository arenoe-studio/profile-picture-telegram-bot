/**
 * Logger.js
 * Logging utility for debugging and monitoring
 */

/**
 * Log levels
 */
const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
};

/**
 * Log a message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    Logger.log(`${logMessage}\n${JSON.stringify(data, null, 2)}`);
  } else {
    Logger.log(logMessage);
  }
}

/**
 * Log info message
 */
function logInfo(message, data = null) {
  log(LOG_LEVELS.INFO, message, data);
}

/**
 * Log warning message
 */
function logWarn(message, data = null) {
  log(LOG_LEVELS.WARN, message, data);
}

/**
 * Log error message
 */
function logError(message, data = null) {
  log(LOG_LEVELS.ERROR, message, data);
}

/**
 * Log debug message
 */
function logDebug(message, data = null) {
  log(LOG_LEVELS.DEBUG, message, data);
}
