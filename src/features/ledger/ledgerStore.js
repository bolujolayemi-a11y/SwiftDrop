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
      status: event.status || 'completed',
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

  
    getWallet: (userId) => {
    if (!userId) {
        return { earnings: 0, withdrawals: 0, balance: 0 };
    }

    const safeEvents = Array.isArray(events) ? events : [];

    const earnings = safeEvents
        .filter(e => e.userId === userId && e.type === 'claim')
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const withdrawals = safeEvents
        .filter(e => e.userId === userId && e.type === 'withdraw')
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const balance = Math.max(0, earnings - withdrawals);

    return {
        earnings: Number.isFinite(earnings) ? earnings : 0,
        withdrawals: Number.isFinite(withdrawals) ? withdrawals : 0,
        balance: Number.isFinite(balance) ? balance : 0
    };
    },

  getEarnings: (userId, token = null) => {
    return events
      .filter(e =>
        e.userId === userId &&
        e.type === 'claim' &&
        (!token || e.token === token)
      )
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  },

  getWithdrawals: (userId, token = null) => {
    return events
      .filter(e =>
        e.userId === userId &&
        e.type === 'withdraw' &&
        (!token || e.token === token)
      );
  },


  subscribe: (fn) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  }
};