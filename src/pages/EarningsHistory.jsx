import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { ledgerStore } from '@/features/ledger/ledgerStore';
import { useTelegram } from '@/hooks/useTelegram';

export default function EarningsHistory({ onNavigate }) {
  const { user } = useTelegram();
  const userId = user?.id?.toString();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const load = () => {
      setEvents(ledgerStore.getUserEvents(userId));
    };

    load();
    return ledgerStore.subscribe(load);
  }, [userId]);

  const claims = events.filter(e => e.type === 'claim');

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
                <p className="text-sm font-semibold">
                  Reward Earned
                </p>

                <p className="text-[10px] text-zinc-500">
                  Drop: {c.dropId}
                </p>

                <p className="text-[10px] text-zinc-600">
                  {new Date(c.timestamp).toLocaleString()}
                </p>
              </div>

              <p className="text-green-400 font-bold">
                +{c.amount} {c.token}
              </p>

            </div>

          </GlassCard>
        ))
      )}
    </div>
  );
}