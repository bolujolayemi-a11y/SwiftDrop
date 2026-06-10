import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { useTelegram } from '@/hooks/useTelegram';
import { dropApi } from '@/services/dropApi';

export default function Withdrawals({ onNavigate }) {
  const { user } = useTelegram();
  const userId = user?.id?.toString();

  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      let backendWithdrawals = [];
      
      // 🌐 1. Wrap API request safely to protect the rendering stream if server ports are offline
      try {
        const res = await dropApi.getWallet(userId);
        backendWithdrawals = (res?.events || []).filter(e => e.type === 'withdraw');
      } catch (err) {
        console.error("Backend offline, loading local withdrawal states natively:", err);
      }

      // 💾 2. Hydrate local isolation records from browser storage keys
      let localWithdrawals = [];
      try {
        localWithdrawals = JSON.parse(
          localStorage.getItem(`swifty_withdrawals_${userId}`) || '[]'
        );
      } catch (e) {
        console.error("Local storage allocation error:", e);
      }

      // 🔄 3. Interleave and cleanly eliminate duplicate transactions
      const merged = [...backendWithdrawals, ...localWithdrawals];
      const uniqueMap = new Map();
      
      merged.forEach(w => {
        // Build a unique tracking key using structural record properties
        const key = w.id || `${w.timestamp || w.time}-${w.amount}`;
        uniqueMap.set(key, w);
      });

      // Reverse map elements to show the absolute newest payouts at the top of the timeline layout
      setWithdrawals(Array.from(uniqueMap.values()).reverse());
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="p-4 space-y-4 text-zinc-100 text-left w-full max-w-md mx-auto animate-reveal">
      <BackButton onBack={() => onNavigate('wallet')} />
      
      <div className="space-y-0.5">
        <h2 className="text-xl font-black text-white tracking-tight">Withdrawals</h2>
        <p className="text-xs text-zinc-500 font-medium">Processing Withdrawal.</p>
      </div>

      <div className="space-y-2 pt-1">
        {!withdrawals.length ? (
          <p className="text-xs font-medium text-zinc-500 text-center py-10 border border-dashed border-zinc-800 rounded-xl">
            No outbound transactions found for this account.
          </p>
        ) : (
          withdrawals.map((w, i) => (
            <GlassCard key={w.id || i} className="p-3.5 flex justify-between items-center bg-zinc-900/10 border-white/5 rounded-xl">
              <div className="space-y-0.5">
                <p className="font-mono font-black text-zinc-400">
                  -{w.amount} <span className="text-[10px] font-sans font-bold text-zinc-500 uppercase">{w.token || 'USDT'}</span>
                </p>
                <p className="text-[9px] font-sans text-zinc-500 font-bold uppercase tracking-wider">
                  TxID: {w.id ? String(w.id).substring(0, 8) : 'Pending Sync'}
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-block text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded-md border ${
                  w.status === 'completed' || w.status === 'success'
                    ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/5 border-amber-500/10 text-amber-400 animate-pulse'
                }`}>
                  {w.status || 'initiated'}
                </span>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}