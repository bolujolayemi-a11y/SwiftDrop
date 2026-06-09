const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const dropApi = {
  // Fetch campaigns from the network ledger
  async fetchAllDrops() {
    try {
      const res = await fetch(`${BASE_URL}/ledger/wallet`); // Or your custom get campaigns route
      if (!res.ok) return [];
      const data = await res.json();
      return data.events || [];
    } catch {
      return [];
    }
  },

  // Save an event log downstream to your Express routes
  async addEvent(eventData) {
    try {
      const res = await fetch(`${BASE_URL}/ledger/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getWallet(userId) {
    const res = await fetch(`${BASE_URL}/ledger/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  }
};