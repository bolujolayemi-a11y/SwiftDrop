import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { getWithdrawals } from '@/api/ledgerApi';
import { useTelegram } from '@/hooks/useTelegram';

export default function Withdrawals({ onNavigate }) {
  const { user } = useTelegram();
  const userId = user?.id?.toString();

  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedToken, setSelectedToken] = useState('USDT');

    useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const data = await getWithdrawals(userId);
      setWithdrawals(data?.data || []);
    };

    load();
  }, [userId]);

  // 🧠 FILTER BY TOKEN
  const filteredWithdrawals = withdrawals.filter(
    w => (w.token || 'USDT') === selectedToken
  );

  return (
    <div className="p-4 space-y-4 text-left">

      <BackButton onBack={() => onNavigate('wallet')} />

      <h2 className="text-xl font-bold">Withdrawals</h2>

      {/* TOKEN SWITCHER */}
      <div className="flex gap-2">
        {['USDT', 'USDC'].map(token => (
          <button
            key={token}
            onClick={() => setSelectedToken(token)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
              selectedToken === token
                ? 'bg-green-500 text-black'
                : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            {token}
          </button>
        ))}
      </div>

      {/* LIST */}
      {!filteredWithdrawals.length ? (
        <p className="text-xs text-zinc-500">
          No {selectedToken} withdrawals yet.
        </p>
      ) : (
        filteredWithdrawals.map((w) => (
          <GlassCard key={w.id} className="p-3 space-y-1">

            <p className="text-sm font-bold text-white">
              -{w.amount} {w.token || 'USDT'}
            </p>

            <p className="text-[10px] text-zinc-500">
              Status: {w.status || 'pending'}
            </p>

            <p className="text-[10px] text-zinc-600">
              {new Date(w.timestamp).toLocaleString()}
            </p>

          </GlassCard>
        ))
      )}

    </div>
  );
}