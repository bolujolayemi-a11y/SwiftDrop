import { INTERACTIVE_DEMOS } from '@/data/mockDrops';

let listeners = [];

/* -----------------------------
   Local Storage Hydration
------------------------------ */

let drops = (() => {
  try {
    const cached = localStorage.getItem('swifty_drops_db');
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
})();

let userClaimsRegistry = (() => {
  try {
    const cached = localStorage.getItem('swifty_claims_registry');
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
})();

/* -----------------------------
   Merchant Profile
------------------------------ */

let merchantProfile = {
  initialized: false,
  telegramId: null,
  username: 'merchant_admin',
  displayName: 'Campaign Admin',
  totalCreated: 0,
  totalVolumeUSD: 0
};

/* -----------------------------
   Storage Sync
------------------------------ */

const syncStoreToDisk = () => {
  localStorage.setItem('swifty_drops_db', JSON.stringify(drops));
  localStorage.setItem(
    'swifty_claims_registry',
    JSON.stringify(userClaimsRegistry)
  );

  listeners.forEach(listener => listener(dropStore.getDrops()));
};

/* -----------------------------
   Store Engine Architecture
------------------------------ */

export const dropStore = {
  initializeMerchantAccount: (tgUser) => {
    const username = tgUser?.username || 'merchant_admin';

    merchantProfile = {
      initialized: true,
      telegramId: tgUser?.id?.toString() || '777000',
      username,
      displayName:
        `${tgUser?.first_name || ''} ${tgUser?.last_name || ''}`.trim() ||
        'Campaign Creator',
      totalCreated: drops.filter(
        drop => drop.creator === username
      ).length,
      totalVolumeUSD: drops
        .filter(drop => drop.creator === username)
        .reduce(
          (sum, drop) => sum + (parseFloat(drop.amount) || 0),
          0
        )
    };

    syncStoreToDisk();

    return merchantProfile;
  },

  getMerchantProfile: () => {
    if (!merchantProfile.initialized) {
      return dropStore.initializeMerchantAccount(null);
    }

    return merchantProfile;
  },

  getDemos: () => INTERACTIVE_DEMOS,

  getDrops: () =>
    drops.map(drop => ({
      ...drop,
      claimsList: drop.analytics?.history || []
    })),

  getDropById: (id) => {
    const drop =
      drops.find(item => item.id === id) ||
      INTERACTIVE_DEMOS.find(item => item.id === id);

    if (!drop) return null;

    return {
      ...drop,
      claimsList: drop.analytics?.history || []
    };
  },

  hasUserClaimed: (userId, dropId) => {
    return !!userClaimsRegistry[`${userId}-${dropId}`];
  },

  addDrop: (newDrop) => {
    const merchant = dropStore.getMerchantProfile();

    const drop = {
      id: `drop-${Math.random()
        .toString(36)
        .substring(2, 11)}`,
      claimedCount: 0,
      token: newDrop.token || 'USDT',
      hasTrivia: !!newDrop.trivia,
      creator: merchant.username,
      communityUrl: newDrop.communityUrl || 'https://t.me/swift_dropbot', // 🚀 Captured Custom Target Venue Hook
      isDemo: false,
      analytics: {
        clicks: 0,
        history: []
      },
      ...newDrop
    };

    drops = [drop, ...drops];

    syncStoreToDisk();

    return drop;
  },

  claimDrop: (id, claimPayload = {}) => {
    const username =
      claimPayload.username || 'anonymous_user';

    const userId =
      claimPayload.userId || 'anonymous';

    const targetIndex = drops.findIndex(
      drop => drop.id === id
    );

    if (targetIndex === -1) {
      return {
        success: false,
        message: 'Reward pool not found.'
      };
    }

    const target = drops[targetIndex];

    if (userClaimsRegistry[`${userId}-${id}`]) {
      return {
        success: false,
        message: 'You already claimed this reward.'
      };
    }

    const maxWinners =
      parseInt(target.winnersCount, 10) || 0;

    if (target.claimedCount >= maxWinners) {
      return {
        success: false,
        message: 'This reward pool is already full.'
      };
    }

    const totalPool =
      parseFloat(target.amount) || 0;

    const spentAlready = (
      target.analytics?.history || []
    ).reduce(
      (sum, claim) =>
        sum + (parseFloat(claim.amount) || 0),
      0
    );

    const remainingPool = Math.max(
      0,
      totalPool - spentAlready
    );

    const remainingSlots =
      maxWinners - target.claimedCount;

    let finalAmount = '0.00';

    if (remainingSlots <= 1) {
      finalAmount = remainingPool.toFixed(2);
    } else {
      const averageAllocation =
        remainingPool / remainingSlots;

      const minPayout = Math.max(
        0.01,
        averageAllocation * 0.5
      );

      const reserveAmount =
        (remainingSlots - 1) * 0.01;

      const maxPayout = Math.max(
        minPayout,
        Math.min(
          remainingPool - reserveAmount,
          averageAllocation * 1.5
        )
      );

      const randomPayout =
        Math.random() *
          (maxPayout - minPayout) +
        minPayout;

      finalAmount = randomPayout.toFixed(2);
    }

    const updatedHistory = [
      {
        username,
        amount: finalAmount,
        time: 'Just now'
      },
      ...(target.analytics?.history || [])
    ];

    drops[targetIndex] = {
      ...target,
      claimedCount: target.claimedCount + 1,
      analytics: {
        ...target.analytics,
        clicks:
          (target.analytics?.clicks || 0) + 1,
        history: updatedHistory
      }
    };

    userClaimsRegistry[`${userId}-${id}`] = true;

    syncStoreToDisk();

    // 🚀 REDIRECT COUPLING LOGIC OVERHAUL:
    // Routes directly to the financial engine bot, appending the target token configuration parameters
    return {
      success: true,
      amountClaimed: finalAmount,
      redirectUrl: `https://t.me/SwiftyEx_bot?start=withdraw_${target.token}_${finalAmount}`
    };
  },

  deleteDrop: (id) => {
    drops = drops.filter(
      drop => drop.id !== id
    );

    syncStoreToDisk();
  },

  getClaimHistory: (id) => {
    const drop = drops.find(
      item => item.id === id
    );

    return drop?.analytics?.history || [];
  },

  getLeaderboard: () => {
    return [...drops]
      .sort(
        (a, b) =>
          (b.claimedCount || 0) -
          (a.claimedCount || 0)
      )
      .slice(0, 20);
  },

  subscribe: (listener) => {
    listeners.push(listener);

    return () => {
      listeners = listeners.filter(
        l => l !== listener
      );
    };
  }
};