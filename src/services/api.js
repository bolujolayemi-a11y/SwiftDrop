import { dropStore } from '@/features/drops/dropStore';

export const api = {
  fetchActivePools: () => dropStore.getDrops(),

  getPoolDetails: (id) =>
    dropStore.getDropById(id),

  initializeCampaign: (payload) =>
    dropStore.addDrop(payload),

  executeClaim: (poolId, user) =>
    dropStore.claimDrop(poolId, user)
};