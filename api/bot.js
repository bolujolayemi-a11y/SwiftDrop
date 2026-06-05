
import { Telegraf, Markup } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);
const MINI_APP_URL = 'https://your-project-name.vercel.app'; 

// Handle incoming startup parameters: e.g., t.me/SwiftyEx_bot?start=drop-xyz
bot.start((ctx) => {
  const startPayload = ctx.startPayload; 
  
  const welcomeMessage = startPayload 
    ? `🎁 *Swifty Reward Drop Detected!*\n\nYou've been invited to claim a dynamic crypto allocation pool.`
    : `⚡ *Welcome to SwiftDrop*\n\nDeploy and track high-conversion micro-incentives natively inside Telegram channels.`;

  // Attach the target deep link parameter directly to the webview URL query string
  const appTargetUrl = startPayload 
    ? `${MINI_APP_URL}?dropId=${startPayload}` 
    : MINI_APP_URL;

  return ctx.replyWithMarkdown(
    welcomeMessage,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Launch App Interface', appTargetUrl)]
    ])
  );
});

// Vercel serverless request handoff entrypoint
export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } else {
      res.status(200).send('SwiftDrop engine running...');
    }
  } catch (error) {
    console.error("Webhook processing failure:", error);
    res.status(500).send('Internal Error');
  }
}