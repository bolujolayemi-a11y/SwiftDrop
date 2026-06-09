import { INTERACTIVE_DEMOS } from '@/data/mockDrops';
import { dropApi } from '@/services/dropApi';

export const dropStore = {
  drops: [],
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
    return this.drops;
  },

  getDemos() {
    return this.demos;
  },

  addDrop(drop) {
    const newDrop = {
      id: `drop-${Date.now()}`, 
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


  getDropById(id) {
    if (!id) return null;
    
    const drops = loadDrops(); 
    const demos = this.demos;

    
    return (
      drops.find(d => String(d.id) === String(id)) ||
      demos.find(d => String(d.id) === String(id)) ||
      null
    );
  },

  hasUserClaimed(userId, dropId) {
    
    return false;
  },

  claimDrop(id, { userId, username }) {
    const drop = this.getDropById(id);
    if (!drop) return { success: false };

    const amountClaimed = (Math.random() * 50 + 1).toFixed(2);
    drop.claimedCount = (drop.claimedCount || 0) + 1;

    
    dropApi.addEvent({
      type: 'claim',
      userId,
      username,
      dropId: id,
      amount: amountClaimed,
      token: drop.token || 'USDT'
    });

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