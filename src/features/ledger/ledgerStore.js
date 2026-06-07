const STORAGE_KEY = 'swifty_event_ledger';

let listeners = [];

let events = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
})();

/* -----------------------------
   SAFE SAVE
------------------------------ */
const save = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  listeners.forEach(l => l([...events]));
};

/* -----------------------------
   NORMALIZER
------------------------------ */
const safeNumber = (val) => {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : 0;
};

const normalizeUserId = (id) => String(id);

/* -----------------------------
   LEDGER STORE
------------------------------ */
export const ledgerStore = {

  addEvent: (event) => {
    const newEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      status: event.status || 'completed',
      ...event,
      userId: normalizeUserId(event.userId)
    };

    events.unshift(newEvent);
    save();
    return newEvent;
  },

  getEvents: () => [...events],

  getUserEvents: (userId) => {
    if (!userId) return [];
    const id = normalizeUserId(userId);
    return events.filter(e => normalizeUserId(e.userId) === id);
  },

  /* -----------------------------
     WALLET (SOURCE OF TRUTH)
  ------------------------------ */
  getWallet: (userId) => {
    if (!userId) {
      return { earnings: 0, withdrawals: 0, balance: 0 };
    }

    const id = normalizeUserId(userId);

    const safeEvents = events.filter(
      e => normalizeUserId(e.userId) === id
    );

    const earnings = safeEvents
      .filter(e => e.type === 'claim')
      .reduce((sum, e) => sum + safeNumber(e.amount), 0);

    const withdrawals = safeEvents
      .filter(e => e.type === 'withdraw' && e.status !== 'failed')
      .reduce((sum, e) => sum + safeNumber(e.amount), 0);

    const balance = Math.max(0, earnings - withdrawals);

    return {
      earnings: Number(earnings.toFixed(2)),
      withdrawals: Number(withdrawals.toFixed(2)),
      balance: Number(balance.toFixed(2))
    };
  },

  /* -----------------------------
     EARNINGS
  ------------------------------ */
  getEarnings: (userId, token = null) => {
    if (!userId) return 0;

    const id = normalizeUserId(userId);

    return events
      .filter(e =>
        normalizeUserId(e.userId) === id &&
        e.type === 'claim' &&
        (!token || e.token === token)
      )
      .reduce((sum, e) => sum + safeNumber(e.amount), 0);
  },

  /* -----------------------------
     WITHDRAWALS
  ------------------------------ */
  getWithdrawals: (userId, token = null) => {
    if (!userId) return [];

    const id = normalizeUserId(userId);

    return events.filter(e =>
      normalizeUserId(e.userId) === id &&
      e.type === 'withdraw' &&
      (!token || e.token === token)
    );
  },

  /* -----------------------------
     SUBSCRIBE
  ------------------------------ */
  subscribe: (fn) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  }
};