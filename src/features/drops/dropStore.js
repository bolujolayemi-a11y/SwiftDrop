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

  // 🚀 FIX: Pulls from live storage index and force-hydrates static demos if visited via direct links
  getDropById: (id) => {
    let drop = drops.find(item => item.id === id);

    if (!drop) {
      const demoDrop = INTERACTIVE_DEMOS.find(item => item.id === id);
      if (demoDrop) {
        drop = { ...demoDrop };
        drops.push(drop);
        localStorage.setItem('swifty_drops_db', JSON.stringify(drops));
      }
    }

    if (!drop) return null;

    return {
      ...drop,
      claimsList: drop.analytics?.history || []
    };
  },

  hasUserClaimed: (userId, dropId) => {
    return !!userClaimsRegistry[`${userId}-${dropId}`];
  },

  // 🚀 NEW ADDITION: Increments incoming deep-link landing views instantly
    incrementClickCount: (id) => {
    const drop = dropStore.getDropById(id);

    if (!drop) return;

    const targetIndex = drops.findIndex(
      item => item.id === id
    );

    if (targetIndex === -1) return;

    drops[targetIndex] = {
      ...drops[targetIndex],
      analytics: {
        ...drops[targetIndex].analytics,
        clicks: (drops[targetIndex].analytics?.clicks || 0) + 1
      }
    };

    syncStoreToDisk();
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
      communityUrl: newDrop.communityUrl || 'https://t.me/swift_dropbot',
      isDemo: false,
      analytics: {
        clicks: 1, // Start with initial creator setup click hit
        history: []
      },
      ...newDrop
    };

    drops = [drop, ...drops];

    syncStoreToDisk();

    return drop;
  },

  claimDrop: (id, claimPayload = {}) => {
    const username = claimPayload.username || 'anonymous_user';
    const userId = claimPayload.userId || 'anonymous';

    const targetIndex = drops.findIndex(drop => drop.id === id);

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

    const maxWinners = parseInt(target.winnersCount, 10) || 0;

    if (target.claimedCount >= maxWinners) {
      return {
        success: false,
        message: 'This reward pool is already full.'
      };
    }

    const totalPool = parseFloat(target.amount) || 0;

    const spentAlready = (target.analytics?.history || []).reduce(
      (sum, claim) => sum + (parseFloat(claim.amount) || 0),
      0
    );

    const remainingPool = Math.max(0, totalPool - spentAlready);
    const remainingSlots = maxWinners - target.claimedCount;

    let finalAmount = '0.00';

    if (remainingSlots <= 1) {
      finalAmount = remainingPool.toFixed(2);
    } else {
      const averageAllocation = remainingPool / remainingSlots;
      const minPayout = Math.max(0.01, averageAllocation * 0.5);
      const reserveAmount = (remainingSlots - 1) * 0.01;
      const maxPayout = Math.max(
        minPayout,
        Math.min(remainingPool - reserveAmount, averageAllocation * 1.5)
      );

      const randomPayout = Math.random() * (maxPayout - minPayout) + minPayout;
      finalAmount = randomPayout.toFixed(2);
    }

    const updatedHistory = [
    {
      userId,
      username,
      amount: finalAmount,
      token: target.token,
      time: Date.now()
    },
    ...(target.analytics?.history || [])
  ];

    // 🔥 CRITICAL FIX: Synchronizes claims count incrementing cleanly alongside clicks data tracking arrays
    drops[targetIndex] = {
      ...target,
      claimedCount: target.claimedCount + 1,
      analytics: {
        ...target.analytics,
        clicks: (target.analytics?.clicks || 0) + 1,
        history: updatedHistory
      }
    };

    userClaimsRegistry[`${userId}-${id}`] = true;

    syncStoreToDisk();

    // 🚀 REDIRECT OVERHAUL (OPTION B): 
    // Clean target link path directly to the bot dashboard to ensure smooth navigation
    return {
      success: true,
      amountClaimed: finalAmount,
      redirectUrl: `https://t.me/SwiftyEx_bot`
    };
  },

  deleteDrop: (id) => {
    drops = drops.filter(drop => drop.id !== id);
    syncStoreToDisk();
  },

  getClaimHistory: (id) => {
    const drop = drops.find(item => item.id === id);
    return drop?.analytics?.history || [];
  },

  getLeaderboard: () => {
    return [...drops]
      .sort((a, b) => (b.claimedCount || 0) - (a.claimedCount || 0))
      .slice(0, 20);
  },

  subscribe: (listener) => {
    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};