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
  const [redirectPayloadUrl, setRedirectPayloadUrl] = useState(''); 
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [statusText, setStatusText] = useState('');

  // 🔄 Hydrate states automatically if a claim footprint exists for this user session
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

      setStatusText('Reward locked in...');

      setTimeout(() => {
        setRevealedAmount(result.amountClaimed);
        setRedirectPayloadUrl(result.redirectUrl); 
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
        const cleanBotUrl = `https://t.me/SwiftyEx_bot`;
        
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.openTelegramLink(cleanBotUrl);
        } else {
          window.open(cleanBotUrl, '_blank');
        }
        
        // 🔄 Delayed reset ensures standard route cleanup happens post-transition
        setTimeout(() => {
          setWithdrawSuccess(false);
          onNavigate('home');
        }, 100);
      }, 1200);
    }, 1500);
  };

  const handleInviteFriends = () => {
    triggerHaptic('success');

    const appUrl = `https://t.me/swift_dropbot/app?startapp=${drop.id}`;
    const rawText = `🎁 I just claimed a reward on SwiftDrop!\n\nGrab your crypto allocation slot before the pool runs dry! 🚀\n\nJoin community updates: ${drop.communityUrl}`;
    const shareText = encodeURIComponent(rawText);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${shareText}`;

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

          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
            {claimState === 'revealed'
              ? 'Reward Unlocked Successfully!'
              : claimState === 'rolling'
              ? 'Unlocking Live Distribution...'
              : drop.title}
          </h2>
          {statusText && <p className="text-xs font-mono text-zinc-500 animate-pulse">{statusText}</p>}
        </div>
      </div>

      <div className="flex items-center justify-center my-auto py-8 w-full">
        {claimState === 'idle' && (
          <div
            onClick={executeClaimSequence}
            className="h-44 w-44 rounded-full flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 hover:border-brand-accent/40 active:scale-95 duration-200 transition-all cursor-pointer group shadow-xl"
          >
            <Gift className="h-10 w-10 text-brand-accent group-hover:animate-bounce" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-2">Tap to Claim</span>
          </div>
        )}

        {claimState === 'rolling' && (
          <div className="text-center bg-zinc-950/40 px-10 py-6 border border-white/5 rounded-3xl backdrop-blur-md">
            <p className="text-5xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white via-zinc-400 to-zinc-600">
              {drop.token === 'USDC' ? '¢' : '$'}{rollingAmount}
            </p>
          </div>
        )}

        {claimState === 'revealed' && (
          <div className="text-center space-y-4 animate-reveal">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-success/20 blur-2xl opacity-40 rounded-full" />
              <CheckCircle className="h-14 w-14 text-brand-success mx-auto relative z-10" />
            </div>

            <h3 className="text-6xl font-black text-white tracking-tighter">
              +{revealedAmount} <span className="text-lg font-mono font-bold text-zinc-400">{drop.token}</span>
            </h3>

            <p className="text-xs text-zinc-400 font-medium max-w-xs mx-auto">
              Allocation successfully locked! Tap below to open SwiftyEx to manage your balance settlement.
            </p>

            <Sparkles className="mx-auto h-4 w-4 text-yellow-400 animate-pulse" />
          </div>
        )}
      </div>

      <div className="space-y-3 w-full max-w-sm mx-auto">
        {claimState === 'revealed' ? (
          <>
            <button
              type="button"
              onClick={handleFlashWithdraw}
              disabled={isWithdrawing || withdrawSuccess}
              className="w-full py-3.5 bg-brand-success text-black rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-green-400 cursor-pointer disabled:opacity-40 transition-all"
            >
              <span>{isWithdrawing ? 'Processing Reward...' : withdrawSuccess ? 'Successful!' : 'Withdraw to SwiftyEx'}</span>
              <ArrowUpRight className="h-3.5 w-3.5 stroke-3" />
            </button>

            <Button variant="secondary" onClick={handleInviteFriends} className="w-full py-3 text-xs font-bold">
              <UserPlus className="h-4 w-4" />
              Invite to Campaign
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => {
                if (typeof setDropId === 'function') setDropId(drop.id);
                onNavigate('leaderboard');
              }} 
              className="w-full py-3 text-xs font-semibold text-zinc-400"
            >
              <BarChart3 className="h-4 w-4" />
              View Leaderboard
            </Button>
          </>
        ) : (
          <>
            <Button onClick={executeClaimSequence} className="w-full py-3.5 text-xs font-bold">
              Claim Allocation
            </Button>

            <Button variant="ghost" onClick={() => onNavigate('home')} className="w-full py-3 text-xs text-zinc-500">
              Cancel and Return
            </Button>
          </>
        )}
      </div>
    </div>
  );
}