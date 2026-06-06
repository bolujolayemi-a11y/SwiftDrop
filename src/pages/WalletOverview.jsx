import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { ledgerStore } from '@/features/ledger/ledgerStore';
import { useTelegram } from '@/hooks/useTelegram';

export default function WalletOverview({ onNavigate }) {
  const { user } = useTelegram();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(ledgerStore.getUserEvents(user?.id?.toString()));
    return ledgerStore.subscribe(setEvents);
  }, [user]);

  const earnings = ledgerStore.getEarnings(user?.id?.toString());
  const withdrawals = ledgerStore.getWithdrawals(user?.id?.toString());

  return (
    <div className="space-y-5 p-4 text-left">
      <BackButton onBack={() => onNavigate('dashboard')} />

      <h2 className="text-xl font-bold">Wallet Overview</h2>

      <GlassCard className="p-4">
        <p className="text-xs text-zinc-400">Total Earnings</p>
        <h3 className="text-3xl font-black text-white">
          {earnings.toFixed(2)} USDT
        </h3>
      </GlassCard>

      <GlassCard className="p-4">
        <p className="text-xs text-zinc-400">Total Withdrawals</p>
        <h3 className="text-xl font-bold text-green-400">
          {withdrawals.length}
        </h3>
      </GlassCard>

      <Button onClick={() => onNavigate('earnings')}>
        View Earnings History
      </Button>
    </div>
  );
}