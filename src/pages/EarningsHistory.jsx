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
      const events = data?.events || [];
      setClaims(events.filter(e => e.type === 'claim'));
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="p-4 space-y-4">
      <BackButton onBack={() => onNavigate('wallet')} />

      <h2 className="text-xl font-bold">Earnings History</h2>

      {!claims.length ? (
        <p className="text-zinc-500 text-sm">No earnings yet</p>
      ) : (
        claims.map((c, i) => {
          const drop = dropStore.getDropById(c.dropId);

          return (
            <GlassCard key={i} className="p-4 flex justify-between">
              <div>
                <p className="font-bold text-white">
                  {c.title || drop?.title || 'Drop Reward'}
                </p>
                <p className="text-[10px] text-zinc-500">{c.dropId}</p>
                <p className="text-[10px] text-zinc-600">
                  {new Date(c.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-green-400 font-bold">
                  +{c.amount}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {c.token}
                </p>
              </div>
            </GlassCard>
          );
        })
      )}
    </div>
  );
}