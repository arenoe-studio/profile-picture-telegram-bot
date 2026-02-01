/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Telegram Bot Webhook.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env, ctx) {
    // Check if the request method is POST (Telegram webhooks are always POST)
    if (request.method === "POST") {
      try {
        const payload = await request.json();

        // Log the payload (optional, be careful with privacy)
        // console.log(JSON.stringify(payload));

        // Handle the update here
        // For example: access the message text
        // const message = payload.message;

        // If you need to forward this to Google App Script:
        // await fetch('YOUR_GAS_WEB_APP_URL', {
        //   method: 'POST',
        //   body: JSON.stringify(payload)
        // });

        // Respond to Telegram that we received the update
        return new Response("OK", { status: 200 });
      } catch (e) {
        return new Response("Error parsing JSON", { status: 400 });
      }
    }

    // Handle GET requests (e.g. to check if the worker is alive)
    return new Response("Telegram Bot Worker is running!", { status: 200 });
  },
};
