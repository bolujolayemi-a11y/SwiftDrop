import { TELEGRAM_BOT_USERNAME } from '@/lib/constants';

/**
 * SwiftyEx Bot Interaction and Deep-Linking Utility
 * Structuring outward communication loops directly into the Telegram ChatBot Layer.
 */
export const swiftyService = {
  /**
   * Generates a structural deep-link parameter string that prompts creators 
   * to fund their newly initialized campaigns directly inside SwiftyEx_bot.
   */
  getFundingLink: (poolId) => {
    if (!poolId) return `https://t.me/${TELEGRAM_BOT_USERNAME}`;
    // Creates: https://t.me/SwiftyEx_bot?start=fund_drop-alpha
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=fund_${poolId}`;
  },

  /**
   * Formats a crisp markdown notification summary string meant to be pasted 
   * into community channels or forwarded by the chatbot.
   */
  formatTelegramShareMessage: (drop) => {
    if (!drop) return "";
    
    const baseLink = `https://t.me/SwiftyDropBot/app?startapp=${drop.id}`;
    
    return [
      `⚡ *NEW SWIFTDROP INITIALIZED* ⚡`,
      `\n"${drop.title}"`,
      `\n🎁 Pool Allocation: ${drop.isMystery ? 'Gamified Mystery Drop' : `${drop.amount} ${drop.token}`}`,
      `👥 Capacity: ${drop.winnersCount} Claim Slots Available`,
      `\nTap the interface action below to pass the validation gate and claim your instant settlement share:`,
      `👉 ${baseLink}`
    ].join('\n');
  }
};