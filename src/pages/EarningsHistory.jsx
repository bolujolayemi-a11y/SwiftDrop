import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { useTelegram } from '@/hooks/useTelegram';
import { dropStore } from '@/features/drops/dropStore';
import { dropApi } from '@/services/dropApi';

export default function EarningsHistory({ onNavigate }) {
  const { user } = useTelegram();
  const userId = user?.id?.toString();

  const [claims, setClaims] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      // 🌐 1. Try fetching backend records safely
      let backendClaims = [];
      try {
        const wallet = await dropApi.getWallet(userId);
        backendClaims = (wallet?.events || []).filter(e => e.type === 'claim');
      } catch (err) {
        console.error("Backend ledger down, falling back strictly to memory context:", err);
      }

      // 🧠 2. Pull local history and FILTER strictly by current profile credentials
      const localClaims = [];
      const drops = dropStore.getDrops();
      
      drops.forEach(drop => {
        const history = drop.analytics?.history || [];
        history.forEach(h => {
          // Verify registration against username string or raw numeric user ID matrix parameters
          const isMyClaim = 
            (h.userId && String(h.userId) === String(userId)) || 
            (h.username && user?.username && String(h.username) === String(user.username));

          if (isMyClaim) {
            localClaims.push({
              id: `${drop.id}-${h.time}-${h.amount}`, // Immutable deterministic lookup key
              type: 'claim',
              dropId: drop.id,
              title: drop.title || 'Drop Reward',
              amount: h.amount,
              token: drop.token || 'USDT',
              timestamp: Date.now()
            });
          }
        });
      });

      // 🔄 3. Merge and securely de-duplicate items based on their structural keys
      const merged = [...backendClaims, ...localClaims];
      const uniqueClaimsMap = new Map();
      
      merged.forEach(item => {
        const uniqueKey = item.id || `${item.dropId}-${item.amount}`;
        uniqueClaimsMap.set(uniqueKey, item);
      });

      // Reverse to show the absolute latest distributions at the top of the viewport list
      setClaims(Array.from(uniqueClaimsMap.values()).reverse());
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [userId, user?.username]);

  return (
    <div className="p-4 space-y-4 text-zinc-100 text-left w-full max-w-md mx-auto animate-reveal">
      <BackButton onBack={() => onNavigate('wallet')} />
      
      <div className="space-y-0.5">
        <h2 className="text-xl font-black text-white tracking-tight">Earnings History</h2>
        <p className="text-xs text-zinc-500 font-medium">All distribution packages collected via community links.</p>
      </div>

      <div className="space-y-2 pt-1">
        {!claims.length ? (
          <p className="text-xs font-medium text-zinc-500 text-center py-10 border border-dashed border-zinc-800 rounded-xl">
            No distributions found for this account.
          </p>
        ) : (
          claims.map((c, i) => (
            <GlassCard key={c.id || i} className="p-4 flex justify-between items-center bg-zinc-900/10 border-white/5 rounded-xl">
              <div className="truncate max-w-[65%]">
                <p className="font-bold text-white truncate">
                  {c.title}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono truncate">{c.dropId}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-emerald-400 font-mono font-black">+{c.amount}</p>
                <p className="text-[10px] text-zinc-500 font-sans font-bold uppercase">{c.token}</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}