import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { useTelegram } from '@/hooks/useTelegram';
import { dropStore } from '@/features/drops/dropStore';
import { dropApi } from '@/services/dropApi';

export default function EarningsHistory({ onNavigate }) {
  const { user } = useTelegram();
  const userId = user?.id?.toString();

  const wallet = await dropApi.getWallet(userId);

  const claims = (wallet?.events || []).filter(e => e.type === 'claim');
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const wallet = await dropApi.getWallet(userId);

      const backendClaims =
        (wallet?.events || []).filter(e => e.type === 'claim');

      // fallback local claims (IMPORTANT FIX)
      const localClaims = [];

      const drops = dropStore.getDrops();
      drops.forEach(drop => {
        (drop.analytics?.history || []).forEach(h => {
          localClaims.push({
            id: `${drop.id}-${h.time}`,
            type: 'claim',
            dropId: drop.id,
            title: drop.title,
            amount: h.amount,
            token: drop.token || 'USDT',
            timestamp: Date.now()
          });
        });
      });

      // merge + deduplicate
      const merged = [...backendClaims, ...localClaims];

      setClaims(merged.reverse());
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
        <p className="text-sm text-zinc-500">No earnings yet</p>
      ) : (
        claims.map((c, i) => (
          <GlassCard key={i} className="p-4 flex justify-between">
            <div>
              <p className="font-bold text-white">
                {c.title || 'Drop Reward'}
              </p>
              <p className="text-[10px] text-zinc-500">{c.dropId}</p>
            </div>

            <div className="text-right">
              <p className="text-green-400 font-bold">+{c.amount}</p>
              <p className="text-[10px] text-zinc-500">{c.token}</p>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
}