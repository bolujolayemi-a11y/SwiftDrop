const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const dropApi = {
  /* =========================================================
     1. SWIFTYEX BASE SIMULATION ENDPOINTS (Postman Matchers)
     ========================================================= */

  // 👤 Simulation: Fetch the live profile context (KYC status, User Details)
  async getSwiftyProfile() {
    try {
      const res = await fetch(`${BASE_URL}/miniapp/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: "" }) // Local debug bypass rule active
      });
      return await res.json();
    } catch (err) {
      console.error("SwiftyEx database node unreachable:", err);
      return null;
    }
  },

  // 🧮 Simulation: Fetch SwiftyEx balances to verify live asset funding
  async getSwiftyWallets() {
    try {
      const res = await fetch(`${BASE_URL}/miniapp/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: "" })
      });
      return await res.json();
    } catch (err) {
      console.error("SwiftyEx storage pool down:", err);
      return null;
    }
  },


  /* =========================================================
     2. CORE CAMPAIGN DROPS & LEDGER WORKSPACE ROUTES
     ========================================================= */

  // Push a newly compiled AI campaign block directly onto your running server node
  async saveNewDrop(dropPayload) {
    try {
      const res = await fetch(`${BASE_URL}/ledger/create-drop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dropPayload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Fetch a specific campaign dynamically from Port 8000
  async fetchDropById(id) {
    try {
      const res = await fetch(`${BASE_URL}/ledger/drop/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.success ? data.drop : null;
    } catch {
      return null;
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

  // Pull down matching records to display in your local frontend UI containers
  async getWallet(userId) {
    try {
      const res = await fetch(`${BASE_URL}/ledger/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      return await res.json();
    } catch {
      return { events: [], earnings: 0, withdrawals: 0, balance: 0 };
    }
  }
};