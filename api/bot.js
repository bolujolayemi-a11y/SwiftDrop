import { Telegraf, Markup } from 'telegraf';
import { kv } from '@vercel/kv'; // 🧠 Connects straight to your new Upstash Redis cluster

const bot = new Telegraf(process.env.BOT_TOKEN);

const MINI_APP_URL = 'https://swift-drop-eta.vercel.app/';

// 🔐 Safe payload validator
function sanitizePayload(payload) {
  if (!payload) return null;

  // allow only safe characters (letters, numbers, -, _)
  const isValid = /^[a-zA-Z0-9_-]+$/.test(payload);

  if (!isValid) return null;

  return payload;
}

bot.start((ctx) => {
  const rawPayload = ctx.startPayload;
  const startPayload = sanitizePayload(rawPayload);

  const isDeepLink = Boolean(startPayload);

  const welcomeMessage = isDeepLink
    ? `🎁 *Swifty Reward Drop Detected!*\n\nYou've been invited to claim a dynamic crypto allocation pool.`
    : `⚡ *Welcome to SwiftDrop*\n\nDeploy and track high-conversion micro-incentives natively inside Telegram channels.`;

  // Build deep link safely
  const appTargetUrl = isDeepLink
    ? `${MINI_APP_URL}?dropId=${encodeURIComponent(startPayload)}`
    : MINI_APP_URL;

  return ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Launch App Interface', appTargetUrl)]
    ])
  });
});

// 🌐 Vercel serverless handler (Unified Routing Engine)
export default async function handler(req, res) {
  const { method, query } = req;

  try {
    // 💾 INTERFACE 1: Save created drops globally into Vercel KV Cache
    if (method === 'POST' && query.action === 'save') {
      const { dropId, dropData } = req.body;
      if (!dropId || !dropData) {
        return res.status(400).json({ success: false, error: 'Missing required payload fields' });
      }
      
      await kv.set(`drop:${dropId}`, dropData); // Stored in cloud cache persistently!
      return res.status(200).json({ success: true });
    }

    // 🔍 INTERFACE 2: Retrieve drop context parameters across external devices
    if (method === 'GET' && query.action === 'get') {
      const { dropId } = query;
      if (!dropId) {
        return res.status(400).json({ success: false, error: 'Missing parameter dropId' });
      }

      const drop = await kv.get(`drop:${dropId}`);
      if (!drop) {
        return res.status(404).json({ success: false, error: 'Allocation pool not found' });
      }

      return res.status(200).json({ success: true, drop });
    }

    // 🤖 INTERFACE 3: Standard Incoming Telegram Bot Webhook Updates
    if (method === 'POST') {
      await bot.handleUpdate(req.body);
      return res.status(200).send('OK');
    }

    return res.status(200).send('SwiftDrop engine running...');
  } catch (error) {
    console.error('Webhook processing failure:', error);
    return res.status(500).send('Internal Error');
  }
}