import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { useTelegram } from '@/hooks/useTelegram';
import { dropApi } from '@/services/dropApi';

export default function Withdrawals({ onNavigate }) {
  const { user } = useTelegram();
  const userId = user?.id?.toString();

  const wallet = await dropApi.getWallet(userId);

  const withdrawals = (wallet?.events || []).filter(e => e.type === 'withdraw');  
  const [withdrawals, setWithdrawals] = useState([]);
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const res = await dropApi.getWallet(userId);

      const backendWithdrawals =
        (res?.events || []).filter(e => e.type === 'withdraw');

      // local withdrawals fallback
      const local = JSON.parse(
        localStorage.getItem(`swifty_withdrawals_${userId}`) || '[]'
      );

      const merged = [...backendWithdrawals, ...local];

      setWithdrawals(merged.reverse());
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="p-4 space-y-4">
      <BackButton onBack={() => onNavigate('wallet')} />
      <h2 className="text-xl font-bold">Withdrawals</h2>

      {!withdrawals.length ? (
        <p className="text-sm text-zinc-500">No withdrawals yet</p>
      ) : (
        withdrawals.map((w, i) => (
          <GlassCard key={i} className="p-3">
            <p className="font-bold text-white">
              -{w.amount} {w.token || 'USDT'}
            </p>
            <p className="text-[10px] text-zinc-500">
              Status: {w.status || 'pending'}
            </p>
          </GlassCard>
        ))
      )}
    </div>
  );
}