import { INTERACTIVE_DEMOS } from '@/data/mockDrops';

export const dropStore = {
  drops: [],
  demos: INTERACTIVE_DEMOS,
  listeners: [],

  // READ ALL DROPS
  getDrops() {
    return this.drops;
  },

  // READ DEMOS
  getDemos() {
    return this.demos;
  },

  // ADD DROP
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
    this.notify();
    return newDrop;
  },

  // GET SINGLE DROP
  getDropById(id) {
    return this.drops.find(d => d.id === id) || null;
  },

  hasUserClaimed(userId, dropId) {
  return false;
  },
  
  claimDrop(id, { userId, username }) {
    const drop = this.getDropById(id);
    if (!drop) return { success: false };

    const amountClaimed = (Math.random() * 50 + 1).toFixed(2);

    drop.claimedCount = (drop.claimedCount || 0) + 1;

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