import { dropApi } from "@/services/dropApi";

export const addEvent = (event) =>
  dropApi.addEvent(event);

export const getWallet = (userId) =>
  dropApi.getWallet(userId);

export const getEarnings = (userId) =>
  dropApi.getEarnings(userId);

export const getWithdrawals = (userId) =>
  dropApi.getWithdrawals(userId);