import { Telegraf, Markup } from 'telegraf';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// 🤖 INITIALIZE YOUR BOT CONTEXT
const bot = new Telegraf(process.env.BOT_TOKEN);
const MINI_APP_URL = 'https://swift-drop-eta.vercel.app/';

// 🧠 INITIALIZE YOUR GLOBAL MEMORY ENGINE
const redis = Redis.fromEnv();

// 🔐 Safe payload validator
function sanitizePayload(payload) {
  if (!payload) return null;
  const isValid = /^[a-zA-Z0-9_-]+$/.test(payload);
  return isValid ? payload : null;
}

bot.start((ctx) => {
  const rawPayload = ctx.startPayload;
  const startPayload = sanitizePayload(rawPayload);
  const isDeepLink = Boolean(startPayload);

  const welcomeMessage = isDeepLink
    ? `🎁 *Swifty Reward Drop Detected!*\n\nYou've been invited to claim a dynamic crypto allocation pool.`
    : `⚡ *Welcome to SwiftDrop*\n\nDeploy and track high-conversion micro-incentives natively inside Telegram channels.`;

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

/* =========================================================
   🤖 POST ROUTE: Handles Bot Webhooks OR Campaign Creation
   ========================================================= */
export const POST = async (request) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // 💾 INTERFACE 1: Save created drops globally into Upstash Redis Cache
    if (action === 'save') {
      const body = await request.json();
      const { dropId, dropData } = body;
      
      if (!dropId || !dropData) {
        return NextResponse.json({ success: false, error: 'Missing required payload fields' }, { status: 400 });
      }

      await redis.set(`drop:${dropId}`, JSON.stringify(dropData));
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 🤖 INTERFACE 2: Standard Incoming Telegram Bot Webhook Updates
    const body = await request.json();
    await bot.handleUpdate(body);
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook or Save execution failure:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
};

/* =========================================================
   🔍 GET ROUTE: Resolves Shared Links on External Devices
   ========================================================= */
export const GET = async (request) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const dropId = searchParams.get('dropId');

  try {
    if (action === 'get') {
      if (!dropId) {
        return NextResponse.json({ success: false, error: 'Missing parameter dropId' }, { status: 400 });
      }

      const drop = await redis.get(`drop:${dropId}`);
      if (!drop) {
        return NextResponse.json({ success: false, error: 'Allocation pool not found' }, { status: 404 });
      }

      // If Upstash returns it as a string, parse it automatically
      const parsedDrop = typeof drop === 'string' ? JSON.parse(drop) : drop;
      return NextResponse.json({ success: true, drop: parsedDrop }, { status: 200 });
    }

    return new NextResponse('SwiftDrop Engine Running...', { status: 200 });

  } catch (error) {
    console.error('Link lookup processing failure:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
};