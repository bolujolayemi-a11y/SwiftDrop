import { dropStore } from '@/features/drops/dropStore';


export const api = {
 
  fetchActivePools: async () => {
    // Simulate minor network latency for visual loader polish
    await new Promise(resolve => setTimeout(resolve, 400));
    return dropStore.getDrops();
  },

  /**
   * Resolves a single campaign structure using its footprint ID
   */
  getPoolDetails: async (poolId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return dropStore.getDropById(poolId);
  },

  /**
   * Submits a newly generated AI campaign payload configuration to the settlement engine
   */
  initializeCampaign: async (campaignData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return dropStore.addDrop(campaignData);
  },

  /**
   * Triggers an atomic verification check and processes claimant payouts
   */
  executeClaim: async (poolId, telegramUser) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const drop = dropStore.getDropById(poolId);
    if (!drop) throw new Error("TARGET_POOL_NOT_FOUND");
    
    // Compute dynamic payout presentation structure if flagged as a mystery drop
    let claimAmount = "5.00";
    if (drop.isMystery) {
      claimAmount = (Math.random() * (25 - 2) + 2).toFixed(2);
    } else {
      claimAmount = (parseFloat(drop.amount) / drop.winnersCount).toFixed(2);
    }

    const username = telegramUser?.username || "hackfest_user";
    dropStore.claimDrop(poolId, username, claimAmount);
    
    return {
      success: true,
      amount: claimAmount,
      token: drop.token,
      txSignature: `sx_tx_${Math.random().toString(36).substr(2, 12)}`
    };
  }
};