/**
 * Main.js
 * Entry point for Google Apps Script Web App
 * 
 * This file handles incoming webhook requests from Cloudflare Worker
 * and routes them to appropriate handlers.
 */

/**
 * Handle POST requests (webhook from Telegram via Cloudflare Worker)
 * @param {Object} e - Event object containing request data
 * @returns {TextOutput} Response
 */
function doPost(e) {
  try {
    // Validate configuration
    validateConfig();
    
    // Parse request body
    const update = JSON.parse(e.postData.contents);
    
    logInfo('Received webhook', { updateId: update.update_id });
    
    // Route update to appropriate handler
    routeUpdate(update);
    
    // Return success response
    return ContentService.createTextOutput('OK');
    
  } catch (error) {
    logError('Error in doPost', { error: error.message, stack: error.stack });
    
    // Return OK even on error to prevent Telegram retries
    return ContentService.createTextOutput('OK');
  }
}

/**
 * Route update to appropriate handler
 * @param {Object} update - Telegram update object
 */
function routeUpdate(update) {
  // Handle message
  if (update.message) {
    handleMessage(update.message);
    return;
  }
  
  // Handle callback query (for inline buttons - future feature)
  if (update.callback_query) {
    logInfo('Callback query received (not implemented)', { callbackQueryId: update.callback_query.id });
    return;
  }
  
  // Handle edited message (ignore for now)
  if (update.edited_message) {
    logInfo('Edited message received (ignored)');
    return;
  }
  
  logWarn('Unknown update type', { update });
}

/**
 * Handle message
 * @param {Object} message - Telegram message object
 */
function handleMessage(message) {
  const chatId = message.chat.id;
  
  // Handle commands
  if (message.text && message.text.startsWith('/')) {
    handleCommand(message);
    return;
  }
  
  // Handle photo
  if (message.photo) {
    handlePhotoMessage(message);
    return;
  }
  
  // Handle text (revision request)
  if (message.text) {
    handleTextMessage(message);
    return;
  }
  
  // Handle other message types (ignore)
  logInfo('Unsupported message type', { chatId, messageKeys: Object.keys(message) });
  sendMessage(chatId, '❓ Tipe pesan tidak didukung.\n\nSilakan kirim foto atau teks. Ketik /help untuk bantuan.');
}

/**
 * Handle GET requests (for testing)
 * @returns {HtmlOutput} Test page
 */
function doGet() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Telegram Formal Photo Bot</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #0088cc; }
          .status { 
            padding: 10px; 
            background: #d4edda; 
            border: 1px solid #c3e6cb; 
            border-radius: 5px;
            margin: 20px 0;
          }
          code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📸 Telegram Formal Photo Bot</h1>
          <div class="status">
            ✅ Web App is running!
          </div>
          <p><strong>Status:</strong> Ready to receive webhooks</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr>
          <h2>Setup Instructions:</h2>
          <ol>
            <li>Copy this Web App URL</li>
            <li>Set it as <code>GAS_WEB_APP_URL</code> in Cloudflare Worker</li>
            <li>Configure Script Properties in Apps Script</li>
            <li>Set Telegram webhook to Cloudflare Worker URL</li>
          </ol>
          <p>See <code>README_GAS.md</code> for detailed instructions.</p>
        </div>
      </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * Test function to verify all dependencies are loaded
 * Run this from Apps Script editor to test
 */
function testDependencies() {
  Logger.log('Testing dependencies...');
  
  try {
    // Test config
    Logger.log('CONFIG.TELEGRAM_BOT_TOKEN: ' + (CONFIG.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET'));
    Logger.log('CONFIG.OPENROUTER_API_KEY: ' + (CONFIG.OPENROUTER_API_KEY ? 'SET' : 'NOT SET'));
    
    // Test functions exist
    Logger.log('sendMessage: ' + typeof sendMessage);
    Logger.log('handleCommand: ' + typeof handleCommand);
    Logger.log('handlePhotoMessage: ' + typeof handlePhotoMessage);
    Logger.log('handleTextMessage: ' + typeof handleTextMessage);
    Logger.log('generateFormalPhoto: ' + typeof generateFormalPhoto);
    Logger.log('parseRevision: ' + typeof parseRevision);
    Logger.log('validatePhoto: ' + typeof validatePhoto);
    
    Logger.log('✅ All dependencies loaded successfully!');
    
  } catch (e) {
    Logger.log('❌ Error: ' + e.message);
  }
}
