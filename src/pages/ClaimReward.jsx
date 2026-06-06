import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { useTelegram } from '@/hooks/useTelegram';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { Gift, CheckCircle, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ledgerStore } from '@/features/ledger/ledgerStore';

export default function ClaimReward({ id, onNavigate }) {
  const { user, triggerHaptic } = useTelegram();
  const drop = dropStore.getDropById(id);

  const [claimState, setClaimState] = useState('idle');
  const [rollingAmount, setRollingAmount] = useState('0.00');
  const [revealedAmount, setRevealedAmount] = useState('');
  const [statusText, setStatusText] = useState('');

  const userId = user?.id?.toString() || 'guest';

  const wallet = ledgerStore.getWallet(userId);

  useEffect(() => {
    if (!drop) return;

    const hasClaimed = dropStore.hasUserClaimed(userId, drop.id);

    if (hasClaimed) {
      const past = drop.claimsList?.find(
        c => c.username === user?.username
      );

      setRevealedAmount(past?.amount || '0.00');
      setClaimState('revealed');
    }
  }, [drop]);

  const triggerConfetti = () => {
    const end = Date.now() + 1200;

    const frame = () => {
      confetti({
        particleCount: 6,
        spread: 70,
        startVelocity: 35,
        gravity: 0.9,
        ticks: 200,
        origin: { x: Math.random(), y: Math.random() * 0.5 }
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  };

  const executeClaim = () => {
    if (claimState !== 'idle') return;

    triggerHaptic('impact');
    setClaimState('rolling');

    const interval = setInterval(() => {
      setRollingAmount((Math.random() * 50 + 1).toFixed(2));
    }, 80);

    const status = setInterval(() => {
      setStatusText('Processing reward...');
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      clearInterval(status);

      const result = dropStore.claimDrop(id, {
        userId,
        username: user?.username || 'user'
      });

      if (!result.success) {
        setClaimState('idle');
        return;
      }

      setRevealedAmount(result.amountClaimed);

      ledgerStore.addEvent({
        type: 'claim',
        userId,
        username: user?.username,
        amount: result.amountClaimed,
        dropId: id,
        token: drop.token
      });

      setClaimState('revealed');
      triggerConfetti();
      triggerHaptic('success');
    }, 2200);
  };

  const handleWithdraw = () => {
    if (!revealedAmount) return;

    ledgerStore.addEvent({
      type: 'withdraw',
      userId,
      username: user?.username,
      amount: revealedAmount,
      dropId: id,
      token: drop.token,
      status: 'initiated'
    });

    window.Telegram?.WebApp?.openTelegramLink(
      'https://t.me/SwiftyEx_bot'
    );

    onNavigate('home');
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
    <div className="max-w-3xl mx-auto px-4 py-6">

      <BackButton onBack={() => onNavigate('home')} />

      {/* WALLET MINI VIEW */}
      {claimState === 'revealed' && (
        <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          💰 Balance: {wallet.balance.toFixed(2)} USDT
        </div>
      )}

      <h2 className="text-xl font-bold text-center">
        {claimState === 'revealed' ? 'Reward Unlocked' : drop.title}
      </h2>

      <div className="flex justify-center my-10">
        {claimState === 'idle' && (
          <div
            onClick={executeClaim}
            className="h-40 w-40 rounded-full flex items-center justify-center bg-zinc-900 border cursor-pointer"
          >
            <Gift />
          </div>
        )}

        {claimState === 'revealed' && (
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-400" />
            <h3 className="text-3xl font-bold">
              +{revealedAmount} {drop.token}
            </h3>
          </div>
        )}
      </div>

      {claimState === 'revealed' && (
        <div className="space-y-2">
          <button
            onClick={() => onNavigate('wallet')}
            className="w-full py-2 bg-zinc-900 border rounded-xl"
          >
            <Wallet size={16} /> View Wallet
          </button>

          <button
            onClick={handleWithdraw}
            className="w-full py-2 bg-green-500 text-black font-bold rounded-xl"
          >
            Withdraw
          </button>
        </div>
      )}
    </div>
  );
}