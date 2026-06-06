import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { ledgerStore } from '@/features/ledger/ledgerStore';
import { useTelegram } from '@/hooks/useTelegram';

export default function EarningsHistory({ onNavigate }) {
  const { user } = useTelegram();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const userId = user?.id?.toString();
    setEvents(ledgerStore.getUserEvents(userId));
    return ledgerStore.subscribe(() =>
      setEvents(ledgerStore.getUserEvents(userId))
    );
  }, [user]);

  const claims = events.filter(e => e.type === 'claim');

  return (
    <div className="p-4 space-y-4 text-left">
      <BackButton onBack={() => onNavigate('wallet')} />

      <h2 className="text-xl font-bold">Earnings History</h2>

      {claims.length === 0 ? (
        <p className="text-xs text-zinc-500">No earnings yet.</p>
      ) : (
        claims.map((c) => (
          <GlassCard key={c.id} className="p-3 flex justify-between">
            <div>
              <p className="text-sm font-semibold">{c.dropId}</p>
              <p className="text-[10px] text-zinc-500">
                {new Date(c.timestamp).toLocaleString()}
              </p>
            </div>
            <p className="text-green-400 font-bold">
              +{c.amount} {c.token}
            </p>
          </GlassCard>
        ))
      )}
    </div>
  );
}