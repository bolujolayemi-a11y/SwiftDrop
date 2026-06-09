const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const request = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });
  return res.json();
};

export const dropApi = {
  getMe: () =>
    request(`${BASE_URL}/miniapp/me`, {
      method: "POST",
      body: JSON.stringify({
        initData: window.Telegram?.WebApp?.initData || ""
      })
    }),
  getTransactions: (page = 1) =>
    request(`${BASE_URL}/miniapp/transactions`, {
      method: "POST",
      body: JSON.stringify({ page })
    }),
  getRates: () =>
    request(`${BASE_URL}/miniapp/rates`),
  addEvent: (event) =>
    request(`${BASE_URL}/ledger/event`, {
      method: "POST",
      body: JSON.stringify(event)
    }),
  getWallet: (userId) =>
    request(`${BASE_URL}/ledger/wallet`, {
      method: "POST",
      body: JSON.stringify({ userId })
    }),
  getEarnings: (userId) =>
    request(`${BASE_URL}/ledger/earnings`, {
      method: "POST",
      body: JSON.stringify({ userId })
    }),
  getWithdrawals: (userId) =>
    request(`${BASE_URL}/ledger/withdrawals`, {
      method: "POST",
      body: JSON.stringify({ userId })
    })
};