import { dropApi } from "@/services/dropApi";

export const ledgerStore = {
  addEvent(event) {
    return dropApi.addEvent(event);
  },

  getWallet(userId) {
    return dropApi.getWallet(userId);
  },

  getEarnings(userId) {
    return dropApi.getEarnings(userId);
  },

  getWithdrawals(userId) {
    return dropApi.getWithdrawals(userId);
  }
};