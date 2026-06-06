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
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const token = drop?.token || 'USDT';

  const wallet = ledgerStore.getWallet(userId) || {
    balance: 0,
    earnings: 0,
    withdrawals: 0
  };

  // -----------------------------
  // CHECK VERIFICATION
  // -----------------------------
  const isVerified = (() => {
    try {
      const data = sessionStorage.getItem(`swifty_verified_${id}`);
      return data ? JSON.parse(data).verified : false;
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (!drop || !userId) return;

    // 🚨 force verify step if required
    if (drop.trivia && !isVerified) {
      onNavigate('verify');
      return;
    }

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
    if (!userId || !drop) return;

    // 🔐 block if not verified
    if (drop.trivia && !isVerified) {
      onNavigate('verify');
      return;
    }

    if (dropStore.hasUserClaimed(userId, drop.id)) return;

    triggerHaptic('impact');
    setState('rolling');

    const fakeStatuses = [
      'Connecting to reward pool...',
      'Scanning slots...',
      'Verifying eligibility...',
      'Finalizing allocation...'
    ];

    let i = 0;
    const statusInterval = setInterval(() => {
      setStatus(fakeStatuses[i % fakeStatuses.length]);
      i++;
    }, 500);

    const rollInterval = setInterval(() => {
      setAmount((Math.random() * 50 + 1).toFixed(2));
    }, 80);

    setTimeout(() => {
      clearInterval(statusInterval);
      clearInterval(rollInterval);

      const result = dropStore.claimDrop(drop.id, {
        userId,
        username: user?.username || 'user'
      });

      if (!result?.success) {
        setState('idle');
        return;
      }

      const finalAmount = result.amountClaimed;

      setAmount(finalAmount);

      ledgerStore.addEvent({
        type: 'claim',
        userId,
        username: user?.username || 'user',
        dropId: drop.id,
        amount: finalAmount,
        token,
        timestamp: Date.now()
      });

      setState('revealed');
      triggerHaptic('success');
      fireConfetti();
    }, 2000);
  };

  // -----------------------------
  // WITHDRAW LOGIC
  // -----------------------------
  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const balance = wallet?.balance ?? 0;

    if (parseFloat(amount) > balance) {
      alert('Insufficient balance');
      return;
    }

    setIsWithdrawing(true);

    setTimeout(() => {
      setIsWithdrawing(false);

      ledgerStore.addEvent({
        type: 'withdraw',
        userId,
        username: user?.username || 'user',
        dropId: drop.id,
        amount,
        token,
        status: 'initiated',
        timestamp: Date.now()
      });

      const botUrl = 'https://t.me/SwiftyEx_bot';

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(botUrl);
      } else {
        window.open(botUrl, '_blank');
      }

      sessionStorage.setItem(
        'returnFromWithdraw',
        JSON.stringify({
          dropId: id,
          page: 'claim'
        })
      );

      setTimeout(() => onNavigate('home'), 200);
    }, 1200);
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

      {/* WALLET PREVIEW */}
      {state === 'revealed' && (
        <div className="text-xs p-3 bg-zinc-900 border rounded-xl">
          💰 Balance: {(wallet?.balance ?? 0).toFixed(2)} {token}
        </div>
      )}

      <h2 className="text-xl font-bold text-center">
        {state === 'revealed' ? 'Reward Unlocked' : drop.title}
      </h2>

      {/* TRIVIA INFO */}
      {drop.trivia && state === 'idle' && (
        <div className="p-3 text-xs bg-zinc-900 border rounded-xl text-zinc-300">
          🧠 {drop.trivia.question}
        </div>
      )}

      {/* CLAIM UI */}
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
        <button
          onClick={handleWithdraw}
          disabled={isWithdrawing}
          className="w-full py-3 bg-green-500 text-black font-bold rounded-xl"
        >
          {isWithdrawing ? 'Processing...' : 'Withdraw to SwiftyEx'}
        </button>
      )}
    </div>
  );
}