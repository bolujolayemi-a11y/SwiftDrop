import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { ledgerStore } from '@/features/ledger/ledgerStore';
import { useTelegram } from '@/hooks/useTelegram';

export default function Withdrawals({ onNavigate }) {
  const { user } = useTelegram();
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    const userId = user?.id?.toString();
    setWithdrawals(ledgerStore.getWithdrawals(userId));
  }, [user]);

  return (
    <div className="p-4 space-y-4 text-left">
      <BackButton onBack={() => onNavigate('wallet')} />

      <h2 className="text-xl font-bold">Withdrawals</h2>

      {withdrawals.length === 0 ? (
        <p className="text-xs text-zinc-500">No withdrawals yet.</p>
      ) : (
        withdrawals.map((w) => (
          <GlassCard key={w.id} className="p-3">
            <p className="text-sm text-white font-bold">
              -{w.amount} {w.token}
            </p>
            <p className="text-[10px] text-zinc-500">
              {new Date(w.timestamp).toLocaleString()}
            </p>
          </GlassCard>
        ))
      )}
    </div>
  );
}