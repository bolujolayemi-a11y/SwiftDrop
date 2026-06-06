import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { ledgerStore } from '@/features/ledger/ledgerStore';
import { useTelegram } from '@/hooks/useTelegram';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { Gift, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClaimReward({ id, onNavigate }) {
  const { user, triggerHaptic } = useTelegram();

  const drop = dropStore.getDropById(id);
  const userId = user?.id?.toString();

  const [state, setState] = useState('idle'); // idle | rolling | revealed
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const wallet = ledgerStore.getWallet(userId);

  const token = drop?.token || 'USDT';

  // -----------------------------
  // Check if already claimed
  // -----------------------------
  useEffect(() => {
    if (!drop || !userId) return;

    const hasClaimed = dropStore.hasUserClaimed(userId, drop.id);

    if (hasClaimed) {
      const past = drop.claimsList?.find(c => c.userId === userId);
      setAmount(past?.amount || '0.00');
      setState('revealed');
    }
  }, [drop, userId]);

  // -----------------------------
  // CONFETTI
  // -----------------------------
  const fireConfetti = () => {
    const end = Date.now() + 1000;

    const frame = () => {
      confetti({
        particleCount: 5,
        spread: 60,
        gravity: 0.9,
        origin: { x: Math.random(), y: Math.random() * 0.4 }
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  };

  // -----------------------------
  // CLAIM LOGIC
  // -----------------------------
  const handleClaim = () => {
    if (state !== 'idle') return;

    if (dropStore.hasUserClaimed(userId, drop.id)) return;

    triggerHaptic('impact');
    setState('rolling');

    const fake = [
      'Connecting to pool...',
      'Checking eligibility...',
      'Allocating reward...',
      'Finalizing...'
    ];

    let i = 0;
    const interval = setInterval(() => {
      setStatus(fake[i % fake.length]);
      i++;
    }, 500);

    const rolling = setInterval(() => {
      setAmount((Math.random() * 50 + 1).toFixed(2));
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      clearInterval(rolling);

      const result = dropStore.claimDrop(drop.id, {
        userId,
        username: user?.username || 'user'
      });

      if (!result.success) {
        setState('idle');
        return;
      }

      setAmount(result.amountClaimed);

      ledgerStore.addEvent({
        type: 'claim',
        userId,
        username: user?.username || 'user',
        dropId: drop.id,
        amount: result.amountClaimed,
        token,
        timestamp: Date.now()
      });

      setState('revealed');
      triggerHaptic('success');
      fireConfetti();
    }, 2000);
  };

  // -----------------------------
  // WITHDRAW LOGIC (PARTIAL)
  // -----------------------------
  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    if (parseFloat(amount) > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    ledgerStore.addEvent({
      type: 'withdraw',
      userId,
      username: user?.username || 'user',
      amount,
      token,
      dropId: drop.id,
      status: 'initiated',
      timestamp: Date.now()
    });

    const botUrl = 'https://t.me/SwiftyEx_bot';

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(botUrl);
    } else {
      window.open(botUrl, '_blank');
    }

    onNavigate('wallet');
  };

  if (!drop) {
    return (
      <div className="p-4 text-center">
        <p>Drop not found</p>
        <Button onClick={() => onNavigate('home')}>Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

      <BackButton onBack={() => onNavigate('home')} />

      {/* WALLET MINI */}
      {state === 'revealed' && (
        <div className="text-xs p-3 bg-zinc-900 border rounded-xl">
          💰 Balance: {wallet.balance.toFixed(2)} {token}
        </div>
      )}

      <h2 className="text-xl font-bold text-center">
        {state === 'revealed' ? 'Reward Unlocked' : drop.title}
      </h2>

      {/* TRIVIA SUPPORT */}
      {drop.trivia && state === 'idle' && (
        <div className="p-3 text-xs bg-zinc-900 border rounded-xl text-zinc-300">
          🧠 Trivia: {drop.trivia.question}
        </div>
      )}

      {/* CLAIM BUTTON */}
      <div className="flex justify-center my-8">
        {state === 'idle' && (
          <div
            onClick={handleClaim}
            className="h-44 w-44 rounded-full flex flex-col items-center justify-center bg-zinc-900 border cursor-pointer"
          >
            <Gift className="h-10 w-10" />
            <p className="text-[10px] mt-2 text-zinc-500">Tap to Claim</p>
          </div>
        )}

        {state === 'revealed' && (
          <div className="text-center space-y-2">
            <CheckCircle className="mx-auto text-green-400" />
            <h3 className="text-4xl font-black">
              +{amount} {token}
            </h3>
          </div>
        )}
      </div>

      {/* STATUS */}
      {status && (
        <p className="text-xs text-center text-zinc-500 animate-pulse">
          {status}
        </p>
      )}

      {/* ACTIONS */}
      {state === 'revealed' && (
        <div className="space-y-2">

          <Button onClick={() => onNavigate('wallet')}>
            View Wallet
          </Button>

          <Button onClick={() => onNavigate('earnings')}>
            Earnings History
          </Button>

          <Button onClick={handleWithdraw}>
            Withdraw to SwiftyEx
          </Button>

        </div>
      )}

    </div>
  );
}