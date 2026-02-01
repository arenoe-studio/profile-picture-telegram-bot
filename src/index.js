/**
 * Cloudflare Worker for Telegram Bot Webhook
 * 
 * This worker receives webhooks from Telegram and forwards them to Google Apps Script.
 * It validates the request and handles errors gracefully.
 */

export default {
  async fetch(request, env, ctx) {
    // Handle GET requests (health check)
    if (request.method === 'GET') {
      return new Response('Telegram Bot Worker is running! ✅', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse incoming webhook payload
      const payload = await request.json();

      // Validate that we have required environment variables
      if (!env.GAS_WEB_APP_URL) {
        console.error('GAS_WEB_APP_URL not configured');
        return new Response('OK', { status: 200 }); // Still return OK to Telegram
      }

      // Optional: Validate Telegram webhook (check for expected structure)
      if (!payload.update_id) {
        console.warn('Invalid Telegram webhook payload:', payload);
        return new Response('OK', { status: 200 });
      }

      // Forward to Google Apps Script with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

      try {
        const gasResponse = await fetch(env.GAS_WEB_APP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Log GAS response for debugging
        const gasText = await gasResponse.text();
        console.log('GAS Response:', gasResponse.status, gasText);

        // Always return OK to Telegram (even if GAS fails)
        return new Response('OK', { status: 200 });

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error('GAS request timeout');
        } else {
          console.error('GAS request failed:', fetchError.message);
        }

        // Still return OK to Telegram to prevent retries
        return new Response('OK', { status: 200 });
      }

    } catch (error) {
      // JSON parsing error or other unexpected errors
      console.error('Worker error:', error.message);
      return new Response('OK', { status: 200 }); // Return OK to prevent Telegram retries
    }
  },
};
