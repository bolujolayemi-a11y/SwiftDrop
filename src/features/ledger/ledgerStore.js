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
    const userEvents = events.filter(e => e.userId === userId);

    const tokens = ['USDT', 'USDC'];

    const wallet = {};

    tokens.forEach(token => {
      const earnings = userEvents
        .filter(e => e.type === 'claim' && e.token === token)
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

      const withdrawals = userEvents
        .filter(e => e.type === 'withdraw' && e.token === token)
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

      wallet[token] = {
        earnings,
        withdrawals,
        balance: Math.max(0, earnings - withdrawals)
      };
    });

    return wallet;
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