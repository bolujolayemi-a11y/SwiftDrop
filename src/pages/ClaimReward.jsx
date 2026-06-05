import React, { useState } from 'react';
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

export default function ClaimReward({ id, onNavigate }) {
  const { user, triggerHaptic } = useTelegram();
  const drop = dropStore.getDropById(id);

  const [claimState, setClaimState] = useState('idle');
  const [rollingAmount, setRollingAmount] = useState('0.00');
  const [revealedAmount, setRevealedAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [statusText, setStatusText] = useState('');
  const triggerConfetti = () => {
  const duration = 1200;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 6,
      spread: 70,
      startVelocity: 35,
      gravity: 0.9,
      ticks: 200,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.5
      }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};
  if (!drop) {
    return (
      <div className="text-center py-12 space-y-4 max-w-md mx-auto px-4">
        <p className="text-zinc-400 text-sm">
          We couldn't find the details for this reward pool.
        </p>
        <Button onClick={() => onNavigate('home')}>Back to Home</Button>
      </div>
    );
  }

    const executeClaimSequence = () => {
    if (claimState !== 'idle') return;

    const userId = user?.id?.toString() || 'guest';

    if (dropStore.hasUserClaimed(userId, drop.id)) {
      triggerHaptic('warning');
      window.alert('You have already claimed this reward.');
      return;
    }

    const maxWinners = parseInt(drop.winnersCount, 10) || 0;
    if (drop.claimedCount >= maxWinners) {
      triggerHaptic('warning');
      window.alert('All rewards have already been claimed.');
      return;
    }

    triggerHaptic('impact');
    setClaimState('rolling');

    const fakeStatuses = [
      'Connecting to reward pool...',
      'Scanning available slots...',
      'Verifying eligibility...',
      'Calculating reward weight...',
      'Finalizing allocation...',
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
        username: user?.username || 'swift_claimer',
      });

      if (!result?.success) {
        triggerHaptic('warning');
        setClaimState('idle');
        setStatusText('');
        window.alert(result?.message || 'Claim failed.');
        return;
      }

      // 💥 tiny suspense before reveal (IMPORTANT FEELING BOOST)
      setStatusText('Reward locked in...');

      setTimeout(() => {
        setRevealedAmount(result.amountClaimed);
        setClaimState('revealed');
        setStatusText('');
        triggerHaptic('success');
        triggerConfetti();
      }, 900);
    }, 2200);
  };

  const handleFlashWithdraw = () => {
    setIsWithdrawing(true);
    triggerHaptic('impact');

    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      triggerHaptic('success');

      setTimeout(() => {
        window.open(
          `https://t.me/SwiftyEx_bot?start=withdraw_${drop.token}_${revealedAmount}`,
          '_blank'
        );
        setWithdrawSuccess(false);
        onNavigate('home');
      }, 1200);
    }, 1500);
  };

  const handleInviteFriends = () => {
    triggerHaptic('success');

    const shareText = encodeURIComponent(
      `🎁 I just claimed a reward on SwiftyDrop!\n\nJoin here:\nhttps://t.me/SwiftyEx_bot?start=${drop.id}`
    );

    const shareUrl = `https://t.me/share/url?url=&text=${shareText}`;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-2 flex flex-col justify-between min-h-[80vh] animate-reveal">

      <div className="space-y-4 text-center w-full">
        <div className="text-left">
          <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />
        </div>

        <div className="pt-2 space-y-3 max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-zinc-400 tracking-wider">
            🎁 REWARD DROP
          </span>

          <h2 className="text-2xl md:text-3xl font-black text-white">
            {claimState === 'revealed'
              ? 'Reward Unlocked Successfully!'
              : claimState === 'rolling'
              ? 'Unlocking Live Distribution...'
              : drop.title}
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center my-auto py-8 w-full">
        {claimState === 'idle' && (
          <div
            onClick={executeClaimSequence}
            className="h-44 w-44 rounded-full cursor-pointer flex items-center justify-center bg-zinc-900"
          >
            <Gift className="h-10 w-10 text-brand-accent" />
          </div>
        )}

        {claimState === 'rolling' && (
          <div className="text-center">
            <p className="text-4xl font-bold">${rollingAmount}</p>
          </div>
        )}

        {claimState === 'revealed' && (
        <div className="text-center space-y-4 animate-bounce-in">

          <div className="relative">
            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-30 animate-pulse rounded-full" />
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
          </div>

          <h3 className="text-6xl font-black text-white">
            +{revealedAmount}
          </h3>

          <p className="text-sm text-zinc-400">
            Reward successfully unlocked
          </p>

          <Sparkles className="mx-auto text-yellow-400 animate-pulse" />
       </div>
        )}
      </div>

      <div className="space-y-3 w-full">
        {claimState === 'revealed' ? (
          <>
            <Button onClick={handleFlashWithdraw} disabled={isWithdrawing}>
              Withdraw Reward <ArrowUpRight className="h-4 w-4" />
            </Button>

            <Button variant="secondary" onClick={handleInviteFriends}>
              <UserPlus className="h-4 w-4" />
              Invite Friends
            </Button>

            <Button variant="ghost" onClick={() => onNavigate('leaderboard')}>
              <BarChart3 className="h-4 w-4" />
              Leaderboard
            </Button>
          </>
        ) : (
          <>
            <Button onClick={executeClaimSequence}>
              Claim Reward
            </Button>

            <Button variant="ghost" onClick={() => onNavigate('home')}>
              Go Back
            </Button>
          </>
        )}
      </div>
    </div>
  );
}