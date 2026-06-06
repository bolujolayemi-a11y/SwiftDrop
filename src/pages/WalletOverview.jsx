import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { ledgerStore } from '@/features/ledger/ledgerStore';
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

    setEvents(ledgerStore.getUserEvents(userId));

    return ledgerStore.subscribe(() => {
      setEvents(ledgerStore.getUserEvents(userId));
    });
  }, [userId]);

  // 🧠 GROUP BALANCES BY TOKEN
  const balances = events.reduce((acc, e) => {
    if (e.type === 'claim') {
      const token = e.token || 'USDT';
      acc[token] = (acc[token] || 0) + parseFloat(e.amount || 0);
    }

    if (e.type === 'withdraw') {
      const token = e.token || 'USDT';
      acc[token] = (acc[token] || 0) - parseFloat(e.amount || 0);
    }

    return acc;
  }, {});

  const balance = balances[selectedToken] || 0;

  const MIN_WITHDRAW = 1;

  // 💸 withdraw handler
  const handleWithdrawConfirm = () => {
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

    ledgerStore.addEvent({
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

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(botUrl);
    } else {
      window.open(botUrl, '_blank');
    }

    setTimeout(() => onNavigate('withdrawals'), 500);
  };

  return (
    <div className="space-y-5 p-4 text-left">

      <BackButton onBack={() => onNavigate('claim')} />

      <h2 className="text-xl font-bold">Wallet Overview</h2>

      {/* TOKEN SELECTOR */}
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

      {/* BALANCE */}
      <GlassCard className="p-4">
        <p className="text-xs text-zinc-400">
          Available {selectedToken} Balance
        </p>
        <h3 className="text-3xl font-black text-white">
          {balance.toFixed(2)} {selectedToken}
        </h3>
      </GlassCard>

      {/* WITHDRAW BUTTON */}
      <Button
        onClick={() => setShowModal(true)}
        className="w-full bg-green-500 text-black font-bold"
      >
        Withdraw {selectedToken}
      </Button>

      {/* NAV */}
      <div className="space-y-2">
        <Button onClick={() => onNavigate('earnings')}>
          View Earnings History
        </Button>

        <Button onClick={() => onNavigate('withdrawals')}>
          View Withdrawals
        </Button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl w-full max-w-sm space-y-4">

            <h3 className="text-lg font-bold">
              Withdraw {selectedToken}
            </h3>

            <p className="text-xs text-zinc-400">
              Min: {MIN_WITHDRAW} | Max: {balance.toFixed(2)} {selectedToken}
            </p>

            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-3 rounded-lg bg-zinc-800 text-white outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-zinc-800 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleWithdrawConfirm}
                className="flex-1 py-2 bg-green-500 text-black font-bold rounded-lg"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}