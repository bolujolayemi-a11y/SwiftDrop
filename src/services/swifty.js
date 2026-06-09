import { TELEGRAM_BOT_USERNAME } from '@/lib/constants';

export const swiftyService = {
  
  getFundingLink: (poolId) => {
    if (!poolId) return `https://t.me/${TELEGRAM_BOT_USERNAME}`;
  
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=fund_${poolId}`;
  },

  
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