import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { getWallet } from '@/api/ledgerApi';
import { useTelegram } from '@/hooks/useTelegram';
import { dropStore } from '@/features/drops/dropStore';

export default function EarningsHistory({ onNavigate }) {
  const { user } = useTelegram();
  const userId = user?.id?.toString();
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const data = await getWallet(userId);
      const allEvents = data?.events || [];
      setClaims(allEvents.filter(e => e.type === 'claim'));
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="p-4 space-y-4 text-left">
      <BackButton onBack={() => onNavigate('wallet')} />
      <h2 className="text-xl font-bold">Earnings History</h2>

      {!claims.length ? (
        <p className="text-xs text-zinc-500">No earnings yet.</p>
      ) : (
        claims.map((c) => {
          // ✅ Resolve drop title from store using dropId
          const drop = dropStore.getDropById(c.dropId);
          const dropTitle = drop?.title || c.dropId || 'Unknown Drop';

          return (
            <GlassCard key={c.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  {/* Drop title */}
                  <p className="text-sm font-bold text-white">{dropTitle}</p>
                  {/* Drop ID in small mono */}
                  <p className="text-[10px] font-mono text-zinc-500">ID: {c.dropId}</p>
                  {/* Timestamp */}
                  <p className="text-[10px] text-zinc-600">
                    {new Date(c.timestamp).toLocaleString()}
                  </p>
                </div>
                {/* Amount + token */}
                <div className="text-right">
                  <p className="text-base font-black text-green-400">
                    +{c.amount}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                    {c.token || 'USDT'}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })
      )}
    </div>
  );
}