import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { getWallet } from '@/api/ledgerApi'; // ✅ use backend
import { useTelegram } from '@/hooks/useTelegram';

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
        claims.map(c => (
          <GlassCard key={c.id} className="p-3 space-y-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold">Reward Earned</p>
                <p className="text-[10px] text-zinc-500">Drop: {c.dropId}</p>
                <p className="text-[10px] text-zinc-600">
                  {new Date(c.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-green-400 font-bold">+{c.amount} {c.token}</p>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
}