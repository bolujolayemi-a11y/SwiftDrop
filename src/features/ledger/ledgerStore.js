const STORAGE_KEY = 'swifty_event_ledger';

let listeners = [];

let events = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
})();

const save = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  listeners.forEach(l => l(events));
};

export const ledgerStore = {
  addEvent: (event) => {
    const newEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      ...event
    };

    events.unshift(newEvent);
    save();
    return newEvent;
  },

  getEvents: () => events,

  getUserEvents: (userId) => {
    return events.filter(e => e.userId === userId);
  },

  getEarnings: (userId) => {
    return events
      .filter(e => e.userId === userId && e.type === 'claim')
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  },

  getWithdrawals: (userId) => {
    return events.filter(e => e.userId === userId && e.type === 'withdraw');
  },

  subscribe: (fn) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  }
};