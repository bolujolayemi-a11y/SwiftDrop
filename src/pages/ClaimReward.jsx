import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { useTelegram } from '@/hooks/useTelegram';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import {
  Gift,
  Sparkles,
  CheckCircle,
  ArrowUpRight,
  UserPlus,
  BarChart3
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClaimReward({ id, onNavigate, setDropId }) {
  const { user, triggerHaptic } = useTelegram();
  const drop = dropStore.getDropById(id);

  const [claimState, setClaimState] = useState('idle');
  const [rollingAmount, setRollingAmount] = useState('0.00');
  const [revealedAmount, setRevealedAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (!drop) return;

    const userId = user?.id?.toString() || 'guest';
    const hasAlreadyClaimed = dropStore.hasUserClaimed(userId, drop.id);

    if (hasAlreadyClaimed) {
      const pastClaimLog = drop.claimsList?.find(
        log => log.username === user?.username || log.userId === userId
      );

      setRevealedAmount(pastClaimLog?.amount || drop.amount || '0.00');
      setClaimState('revealed');
    }
  }, [id, user, drop]);

  const shortDescription =
    drop?.description?.length > 140
      ? drop.description.slice(0, 140) + '...'
      : drop?.description;

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

  if (!drop) {
    return (
      <div className="text-center py-12 space-y-4 max-w-md mx-auto px-4">
        <p className="text-zinc-400 text-sm">Drop not found.</p>
        <Button onClick={() => onNavigate('home')}>Back to Home</Button>
      </div>
    );
  }

  const executeClaimSequence = () => {
    if (claimState !== 'idle') return;

    const userId = user?.id?.toString() || 'guest';

    if (dropStore.hasUserClaimed(userId, drop.id)) return;

    triggerHaptic('impact');
    setClaimState('rolling');

    const fakeStatuses = [
      'Connecting to reward pool...',
      'Scanning available slots...',
      'Verifying eligibility...',
      'Finalizing allocation...'
    ];

    let i = 0;
    const statusInterval = setInterval(() => {
      setStatusText(fakeStatuses[i % fakeStatuses.length]);
      i++;
    }, 600);

    const numberInterval = setInterval(() => {
      setRollingAmount((Math.random() * 50 + 1).toFixed(2));
    }, 80);

    setTimeout(() => {
      clearInterval(numberInterval);
      clearInterval(statusInterval);

      const result = dropStore.claimDrop(drop.id, {
        userId,
        username: user?.username || 'user'
      });

      if (!result?.success) {
        setClaimState('idle');
        return;
      }

      setRevealedAmount(result.amountClaimed);
      setClaimState('revealed');
      triggerHaptic('success');
      triggerConfetti();
    }, 2200);
  };

  const handleFlashWithdraw = () => {
    setIsWithdrawing(true);
    triggerHaptic('impact');

    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);

      setTimeout(() => {
        const botUrl = `https://t.me/SwiftyEx_bot`;

        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.openTelegramLink(botUrl);
        } else {
          window.open(botUrl, '_blank');
        }

        // IMPORTANT FIX (see explanation below)
        sessionStorage.setItem('returnFromWithdraw', JSON.stringify({
        dropId: id,
        page: 'claim'
      }));

      setTimeout(() => {
        onNavigate('home');
      }, 150);
      }, 1200);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-2 flex flex-col min-h-[80vh]">

      <BackButton onBack={() => onNavigate('home')} />

      <div className="text-center space-y-3">
        <h2 className="text-2xl font-black text-white">
          {claimState === 'revealed'
            ? 'Reward Unlocked!'
            : drop.title}
        </h2>

        {/* ✅ DROP DESCRIPTION ADDED HERE */}
        {claimState === 'idle' && shortDescription && (
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {shortDescription}
          </p>
        )}

        {statusText && (
          <p className="text-xs text-zinc-500 animate-pulse">
            {statusText}
          </p>
        )}
      </div>

      <div className="flex justify-center my-auto py-10">
        {claimState === 'idle' && (
          <div
            onClick={executeClaimSequence}
            className="h-44 w-44 rounded-full flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 cursor-pointer"
          >
            <Gift className="h-10 w-10 text-white" />
            <span className="text-[10px] text-zinc-500 mt-2">
              Tap to Claim
            </span>
          </div>
        )}

        {claimState === 'revealed' && (
          <div className="text-center space-y-3">
            <CheckCircle className="h-14 w-14 text-green-400 mx-auto" />

            <h3 className="text-5xl font-black">
              +{revealedAmount} {drop.token}
            </h3>

            <p className="text-xs text-zinc-400">
              Allocation locked successfully
            </p>
          </div>
        )}
      </div>

      {claimState === 'revealed' && (
        <button
          onClick={handleFlashWithdraw}
          className="w-full py-3 bg-green-500 text-black font-bold rounded-xl"
        >
          Withdraw to SwiftyEx
        </button>
      )}
    </div>
  );
}