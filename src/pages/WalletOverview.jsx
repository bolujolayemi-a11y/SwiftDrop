import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { getWallet, addEvent } from '@/api/ledgerApi';
import { useTelegram } from '@/hooks/useTelegram';

export default function WalletOverview({ onNavigate }) {
  const { user, triggerHaptic } = useTelegram();
  const userId = user?.id?.toString();

  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const data = await getWallet(userId);
      setEvents(data?.events || []);
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const balances = events.reduce((acc, e) => {
    const token = e.token || 'USDT';
    if (e.type === 'claim') acc[token] = (acc[token] || 0) + parseFloat(e.amount || 0);
    if (e.type === 'withdraw') acc[token] = (acc[token] || 0) - parseFloat(e.amount || 0);
    return acc;
  }, {});

  const balance = balances[selectedToken] || 0;
  const MIN_WITHDRAW = 1;

  const handleWithdrawConfirm = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount)) return;

    if (amount < MIN_WITHDRAW) {
      alert(`Minimum withdrawal is ${MIN_WITHDRAW} ${selectedToken}`);
      return;
    }

    if (amount > balance) {
      alert(`Insufficient ${selectedToken} balance`);
      return;
    }

    triggerHaptic?.('impact');

    await addEvent({
      type: 'withdraw',
      userId,
      username: user?.username || 'anonymous',
      amount: amount.toFixed(2),
      token: selectedToken,
      status: 'initiated',
      source: 'wallet'
    });

    setShowModal(false);
    setWithdrawAmount('');

    const botUrl = 'https://t.me/SwiftyEx_bot';
    if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink(botUrl);
    else window.open(botUrl, '_blank');

    setTimeout(() => onNavigate('withdrawals'), 500);
  };

  return (
    <div className="space-y-4 p-4 text-left w-full max-w-md mx-auto animate-reveal">
      <BackButton onBack={() => onNavigate('dashboard')} fallbackText="Dashboard" />
      <div className="space-y-0.5">
        <h2 className="text-xl font-black tracking-tight text-white">Wallet</h2>
        <p className="text-xs text-zinc-500 font-mono">ID: {userId || "LOCAL_NODE"}</p>
      </div>

      <div className="flex gap-1.5 bg-zinc-950/60 p-1 border border-white/5 rounded-xl w-max">
        {['USDT', 'USDC'].map(t => (
          <button
            key={t}
            onClick={() => setSelectedToken(t)}
            className={`px-3 py-1 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer ${
              selectedToken === t ? 'bg-brand-accent text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <GlassCard className="p-4 bg-zinc-900/20 border-white/5 rounded-xl flex flex-col gap-0.5">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Settled {selectedToken} Assets</p>
        <h3 className="text-3xl font-mono font-black text-white tracking-tight">
          {balance.toFixed(2)} <span className="text-xs font-sans text-zinc-500">{selectedToken}</span>
        </h3>
      </GlassCard>

      <Button onClick={() => setShowModal(true)} className="w-full font-black py-3.5 text-xs uppercase tracking-widest bg-brand-success text-black">
        Withdraw to SwiftyEx Ledger
      </Button>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button variant="secondary" onClick={() => onNavigate('earnings')} className="py-2.5 text-xs font-bold">History</Button>
        <Button variant="secondary" onClick={() => onNavigate('withdrawals')} className="py-2.5 text-xs font-bold">Withdrawals</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-reveal">
          <div className="bg-zinc-950 border border-white/5 p-5 rounded-2xl w-full max-w-xs space-y-4 shadow-2xl text-left">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white">Initiate Withdrawal</h3>
              <p className="text-[10px] text-zinc-500 font-mono">Max: {balance.toFixed(2)} {selectedToken}</p>
            </div>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 font-mono font-bold text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-700"
            />
            <div className="flex gap-2 text-xs font-bold pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 rounded-xl text-zinc-400">Cancel</button>
              <button onClick={handleWithdrawConfirm} className="flex-1 py-2.5 bg-brand-accent text-white rounded-xl shadow-lg shadow-brand-accent/10">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}