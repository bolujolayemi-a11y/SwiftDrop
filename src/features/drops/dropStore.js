import { INTERACTIVE_DEMOS } from '@/data/mockDrops';
import { dropApi } from '@/services/dropApi';

const STORAGE_KEY = 'swifty_drops';

function loadDrops() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDrops(drops) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drops));
  } catch (err) {
    console.error('Failed to sync drops array to device disk:', err);
  }
}

let userClaimsRegistry = (() => {
  try {
    const cached = localStorage.getItem('swifty_claims_registry');
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
})();

export const dropStore = {
  drops: loadDrops(), 
  demos: INTERACTIVE_DEMOS,
  listeners: [],

  async syncWithBackend() {
    try {
      return this.drops;
    } catch {
      return this.drops;
    }
  },

  getDrops() {
    this.drops = loadDrops(); 
    // 🧠 FIX: Hide any cloned interactive demos from showing up on the Merchant Dashboard
    return this.drops.filter(d => d.isDemo !== true);
  },

  getDemos() {
    return this.demos;
  },

  addDrop(drop) {
    const newDrop = {
      id: `drop-${Date.now()}`, 
      claimedCount: 0,
      winnersCount: parseInt(drop.winnersCount, 10) || 100,
      isMystery: !!drop.isMystery,
      hasTrivia: !!drop.trivia,
      token: drop.token || 'USDT',
      isDemo: false, // Core merchant campaign flag
      analytics: {
        clicks: 1,
        history: []
      },
      ...drop
    };

    this.drops = [newDrop, ...loadDrops()];
    saveDrops(this.drops); 
    this.notify();
    return newDrop;
  },

  // 🧠 RESILIENT IDENTIFIER NORMALIZER
  getDropById(id) {
    if (!id) return null;
    
    const activeDrops = loadDrops(); 
    const demos = this.demos;

    const cleanId = (input) => {
      return String(input)
        .replace(/^drop_/, '')
        .replace(/^claim_/, '')
        .replace(/^drop-/, '')
        .trim();
    };

    const targetId = cleanId(id);

    return (
      activeDrops.find(d => cleanId(d.id) === targetId || String(d.id) === String(id)) ||
      demos.find(d => cleanId(d.id) === targetId || String(d.id) === String(id)) ||
      null
    );
  },

  hasUserClaimed(userId, dropId) {
    if (!userId || !dropId) return false;
    return !!userClaimsRegistry[`${userId}-${dropId}`];
  },

  claimDrop(id, { userId, username }) {
    this.drops = loadDrops();
    const drop = this.getDropById(id);
    if (!drop) return { success: false, message: 'Pool context not resolved.' };

    if (this.hasUserClaimed(userId, drop.id)) {
      return { success: false, message: 'Allocation slots filled for user.' };
    }

    const targetIndex = this.drops.findIndex(d => String(d.id) === String(drop.id));
    
    // 💵 FIX: Dynamic Math Allocation Engine
    // 💵 TRUE RANDOMIZED DYNAMIC POOL MATH ENGINE
    const totalPoolSize = parseFloat(drop.amount) || 0;
    const maxWinners = parseInt(drop.winnersCount, 10) || 1;
    
    // 1. Calculate how much capital has already been claimed out of this pool
    const claimedVolume = (drop.analytics?.history || []).reduce(
      (sum, record) => sum + parseFloat(record.amount || 0), 
      0
    );
    
    const remainingPool = Math.max(0, totalPoolSize - claimedVolume);
    const remainingSlots = Math.max(1, maxWinners - drop.claimedCount);
    
    let amountClaimed = '0.00';

    if (remainingSlots <= 1) {
      // 🎯 Last person standing takes the absolute remainder of the capital to empty the pool perfectly
      amountClaimed = remainingPool.toFixed(2);
    } else if (remainingPool <= 0) {
      amountClaimed = '0.00';
    } else {
      // 🎰 Dynamic Boundary Formula: Compute weighted random allocation caps
      const averageRemainingAllocation = remainingPool / remainingSlots;
      
      // Keep a tiny reserve so future users are guaranteed to get at least $0.01
      const safetyReserve = (remainingSlots - 1) * 0.01;
      
      const minPayout = 0.01;
      const maxPayout = Math.max(
        minPayout, 
        Math.min(remainingPool - safetyReserve, averageRemainingAllocation * 2)
      );

      // Roll the dice between the minimum penny and our mathematical ceiling
      const randomRoll = Math.random() * (maxPayout - minPayout) + minPayout;
      amountClaimed = randomRoll.toFixed(2);
    }
    
    drop.claimedCount = (drop.claimedCount || 0) + 1;
    if (!drop.analytics) drop.analytics = { clicks: 1, history: [] };
    if (!drop.analytics.history) drop.analytics.history = [];

    drop.analytics.history.unshift({
      username: username || 'anonymous_user',
      amount: amountClaimed,
      time: 'Just now'
    });

    if (targetIndex !== -1) {
      this.drops[targetIndex] = drop;
    } else {
      this.drops.push(drop); // Clone demo drops into live tracking local storage safely
    }

    // Persist modifications to disk storage fields
    userClaimsRegistry[`${userId}-${drop.id}`] = true;
    localStorage.setItem('swifty_claims_registry', JSON.stringify(userClaimsRegistry));
    saveDrops(this.drops);

    // Push analytics ping downstream to your running API port
    dropApi.addEvent({
      type: 'claim',
      userId,
      username,
      dropId: drop.id,
      amount: amountClaimed,
      token: drop.token || 'USDT'
    });

    this.notify();

    return {
      success: true,
      amountClaimed
    };
  },

  deleteDrop(id) {
    this.drops = loadDrops().filter(d => String(d.id) !== String(id));
    saveDrops(this.drops);
    this.notify();
  },

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  },

  notify() {
    this.listeners.forEach(fn => fn([...this.drops]));
  }
};