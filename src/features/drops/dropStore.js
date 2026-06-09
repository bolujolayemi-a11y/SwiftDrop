import { INTERACTIVE_DEMOS } from '@/data/mockDrops';

const STORAGE_KEY = 'swifty_drops';

function loadDrops() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDrops(drops) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drops));
}

export const dropStore = {
  drops: loadDrops(),
  demos: INTERACTIVE_DEMOS,
  listeners: [],

  getDrops() {
    this.drops = loadDrops(); // always sync
    return this.drops;
  },

  getDemos() {
    return this.demos;
  },

  addDrop(drop) {
    const newDrop = {
      id: Date.now().toString(),
      claimedCount: 0,
      winnersCount: 100,
      isMystery: false,
      hasTrivia: false,
      ...drop
    };

    this.drops.unshift(newDrop);
    saveDrops(this.drops);     // ✅ SAVE
    this.notify();

    return newDrop;
  },

  getDropById(id) {
    const drops = loadDrops();  // ✅ ALWAYS FRESH
    const demos = this.demos;

    return (
      drops.find(d => d.id === id) ||
      demos.find(d => d.id === id) ||
      null
    );
  },

  hasUserClaimed(userId, dropId) {
    return false;
  },

  claimDrop(id, { userId, username }) {
    const drops = loadDrops();
    const drop = drops.find(d => d.id === id);

    if (!drop) return { success: false };

    const amountClaimed = (Math.random() * 50 + 1).toFixed(2);

    drop.claimedCount = (drop.claimedCount || 0) + 1;

    saveDrops(drops);   // ✅ SAVE UPDATE
    this.drops = drops;
    this.notify();

    return {
      success: true,
      amountClaimed
    };
  },

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  },

  notify() {
    this.listeners.forEach(fn => fn(this.drops));
  }
};