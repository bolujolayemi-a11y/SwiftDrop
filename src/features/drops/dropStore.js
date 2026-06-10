import { INTERACTIVE_DEMOS } from '@/data/mockDrops';
import { dropApi } from '@/services/dropApi';

const STORAGE_KEY = 'swifty_drops';

// Base API URL pointing straight to your active serverless function route
const VERCEL_API_ENDPOINT = 'https://swift-drop-eta.vercel.app/api/bot';

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
    return this.drops.filter(d => d.isDemo !== true);
  },

  getDemos() {
    return this.demos;
  },

  // 💾 1. SAVE LOCAL DISK CAMPAIGNS AND PUSH COPIES TO VERCEL REDIS KV
  async addDrop(drop) {
    const newDrop = {
      id: `drop-${Date.now()}`, 
      claimedCount: 0,
      winnersCount: parseInt(drop.winnersCount, 10) || 100,
      isMystery: !!drop.isMystery,
      hasTrivia: !!drop.trivia,
      token: drop.token || 'USDT',
      isDemo: false, 
      analytics: {
        clicks: 1,
        history: []
      },
      ...drop
    };

    // Keep state management lightning fast locally for the active user session
    this.drops = [newDrop, ...loadDrops()];
    saveDrops(this.drops); 
    this.notify();

    // 🔥 BACKEND SYNC: Broadcast allocation details globally to Vercel KV via Upstash
    try {
      await fetch(`${VERCEL_API_ENDPOINT}?action=save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dropId: newDrop.id, dropData: newDrop })
      });
      console.log(`📡 Campaign globally backed up to Vercel Cloud Cache: ${newDrop.id}`);
    } catch (err) {
      console.error('Vercel KV over-the-air synchronization failed:', err);
    }

    return newDrop;
  },

  // 🔍 2. DYNAMIC LOOKUP WITH MULTI-DEVICE CLOUD FAILSAFE
  async getDropById(id) {
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

    // Look locally on the current user's disk storage matrix first
    const foundLocal = 
      activeDrops.find(d => cleanId(d.id) === targetId || String(d.id) === String(id)) ||
      demos.find(d => cleanId(d.id) === targetId || String(d.id) === String(id));

    if (foundLocal) return foundLocal;

    // 🔥 MULTI-DEVICE OVER-THE-AIR RESOLVER: Fallback to your live cloud KV datastore
    try {
      const response = await fetch(`${VERCEL_API_ENDPOINT}?action=get&dropId=${id}`);
      const result = await response.json();
      if (result.success && result.drop) {
        console.log(`🔗 Unrecognized cross-device campaign resolved from Vercel KV storage!`);
        return result.drop;
      }
    } catch (err) {
      console.error('Remote data synchronization fallback failed:', err);
    }

    return null;
  },

  hasUserClaimed(userId, dropId) {
    if (!userId || !dropId) return false;
    return !!userClaimsRegistry[`${userId}-${dropId}`];
  },

  claimDrop(id, { userId, username }) {
    this.drops = loadDrops();
    
    // 🧠 FIX: Reference this.drops accurately instead of the unbound activeDrops array
    const drop = this.drops.find(d => String(d.id) === String(id)) || this.demos.find(d => String(d.id) === String(id));
    if (!drop) return { success: false, message: 'Pool context not resolved.' };

    if (this.hasUserClaimed(userId, drop.id)) {
      return { success: false, message: 'Allocation slots filled for user.' };
    }

    const targetIndex = this.drops.findIndex(d => String(d.id) === String(drop.id));
    
    const totalPoolSize = parseFloat(drop.amount) || 0;
    const maxWinners = parseInt(drop.winnersCount, 10) || 1;
    
    const claimedVolume = (drop.analytics?.history || []).reduce(
      (sum, record) => sum + parseFloat(record.amount || 0), 
      0
    );
    
    const remainingPool = Math.max(0, totalPoolSize - claimedVolume);
    const remainingSlots = Math.max(1, maxWinners - drop.claimedCount);
    
    let amountClaimed = '0.00';

    if (remainingSlots <= 1) {
      amountClaimed = remainingPool.toFixed(2);
    } else if (remainingPool <= 0) {
      amountClaimed = '0.00';
    } else {
      const averageRemainingAllocation = remainingPool / remainingSlots;
      const safetyReserve = (remainingSlots - 1) * 0.01;
      const minPayout = 0.01;
      const maxPayout = Math.max(
        minPayout, 
        Math.min(remainingPool - safetyReserve, averageRemainingAllocation * 2)
      );

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
      this.drops.push(drop); 
    }

    userClaimsRegistry[`${userId}-${drop.id}`] = true;
    localStorage.setItem('swifty_claims_registry', JSON.stringify(userClaimsRegistry));
    saveDrops(this.drops);

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