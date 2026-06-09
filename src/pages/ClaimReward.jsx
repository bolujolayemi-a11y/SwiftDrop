import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { addEvent } from '@/api/ledgerApi';
import { useTelegram } from '@/hooks/useTelegram';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { Gift, CheckCircle, Share2, Users, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-commetti';

export default function ClaimReward({ id, onNavigate }) {
  const { user, triggerHaptic, tg } = useTelegram();

  const drop = dropStore.getDropById(id);
  const userId = user?.id?.toString();

  const [state, setState] = useState('idle');
  const [amount, setAmount] = useState('0.00');
  const [status, setStatus] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const token = drop?.token || 'USDT';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`swifty_verified_${id}`);
      const parsed = raw ? JSON.parse(raw) : null;
      setIsVerified(parsed?.verified === true);
    } catch {
      setIsVerified(false);
    }
  }, [id]);

  const handleShareVerify = () => {
    const link = `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=Unlocking global allocations on SwiftDrop 🚀`;

    if (tg?.openLink) tg.openLink(link);
    else window.open(link, '_blank');

    sessionStorage.setItem(
      `swifty_verified_${id}`,
      JSON.stringify({ verified: true })
    );

    setIsVerified(true);
    triggerHaptic('success');
  };

  const handleClaim = () => {
    if (!isVerified) {
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('impact');
    setState('rolling');
    
    const fakeStatuses = ['Connecting pool network...', 'Checking human footprint...', 'Signing allocation ledger...'];
    let i = 0;
    const interval = setInterval(() => {
      setStatus(fakeStatuses[i % fakeStatuses.length]);
      i++;
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      const result = dropStore.claimDrop(drop.id, {
        userId,
        username: user?.username || 'user'
      });

      if (!result?.success) {
        setState('idle');
        setStatus('');
        return;
      }

      const finalAmount = result.amountClaimed || '0.00';
      setAmount(finalAmount);

      addEvent({
        type: 'claim',
        userId,
        username: user?.username || 'user',
        dropId: drop.id,
        amount: finalAmount,
        token,
        timestamp: Date.now()
      });

      setState('revealed');
      setStatus('');
      confetti();
      triggerHaptic('success');
    }, 2000);
  };

  if (!drop) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh] text-center text-zinc-500 animate-reveal">
        <AlertCircle className="h-8 w-8 text-zinc-700 mb-2" />
        <p className="text-xs font-medium">Campaign data reference mismatch. Please reload link context.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 flex flex-col justify-between min-h-[82vh] text-left animate-reveal">
      <div className="space-y-4">
        <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />
        <div className="text-center space-y-1.5 pt-1">
          <span className="inline-flex bg-zinc-900 border border-zinc-800/80 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
            🎁 Live Distribution
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">{state === 'revealed' ? 'Allocation Secured' : drop.title}</h2>
          {status && <p className="text-xs font-mono text-brand-accent animate-pulse">{status}</p>}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center my-auto py-6 w-full">
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div
              onClick={handleClaim}
              className={`h-40 w-40 rounded-full flex flex-col items-center justify-center bg-zinc-900/60 border transition-all duration-300 relative group select-none ${
                isVerified ? 'border-brand-accent/40 shadow-xl shadow-brand-accent/5 cursor-pointer active:scale-95' : 'border-zinc-800/60 opacity-40 cursor-not-allowed'
              }`}
            >
              <Gift className={`h-9 w-9 ${isVerified ? 'text-brand-accent group-hover:scale-105' : 'text-zinc-600'} transition-transform`} />
              <span className="text-[9px] font-mono font-black tracking-widest uppercase text-zinc-500 pt-1.5">
                {isVerified ? 'Tap to Claim' : 'Locked'}
              </span>
            </div>

            {!isVerified ? (
              <div className="w-full space-y-3 text-center">
                <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  Anti-sybil security layer triggered. Share this promotional pool link to unlock your human reward routing access.
                </p>
                <button
                  type="button"
                  onClick={handleShareVerify}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share to Unlock Reward
                </button>
              </div>
            ) : (
              <p className="text-xs text-brand-success font-bold flex items-center gap-1">
                Verified — you can claim now
              </p>
            )}
          </div>
        )}

        {state === 'rolling' && (
          <div className="text-center bg-zinc-950/40 px-10 py-5 border border-white/5 rounded-2xl animate-pulse">
            <p className="text-4xl font-mono font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-zinc-600">${amount}</p>
          </div>
        )}

        {state === 'revealed' && (
          <div className="text-center space-y-3 w-full">
            <CheckCircle className="text-brand-success mx-auto h-12 w-12 drop-shadow-[0_4px_12px_rgba(34,197,94,0.15)]" />
            <div className="space-y-0.5">
              <h3 className="text-4xl font-mono font-black text-white">+{amount} <span className="text-sm font-sans font-bold text-zinc-500">{token}</span></h3>
              <p className="text-[11px] text-zinc-500 font-medium">Claims balances settled cleanly in local application registry profiles.</p>
            </div>
            <Sparkles className="mx-auto h-3.5 w-3.5 text-amber-400 animate-pulse" />
          </div>
        )}
      </div>

      {state === 'revealed' && (
        <div className="space-y-2 w-full max-w-xs mx-auto mt-auto">
          <Button onClick={() => onNavigate('wallet')} className="w-full py-3 text-xs uppercase font-black tracking-wider">Open Wallet</Button>
          <Button
            variant="secondary"
            onClick={() => {
              const link = `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I just claimed ${amount} ${token}! 🚀`;
              if (tg?.openLink) tg.openLink(link); else window.open(link, '_blank');
            }}
            className="w-full py-2.5 text-xs font-bold"
          >
            <Share2 className="h-3.5 w-3.5" /> Invite Friends
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('leaderboard')} className="w-full py-2 text-xs font-semibold text-zinc-500">
            <Users className="h-3.5 w-3.5" /> View Leaderboard
          </Button>
        </div>
      )}
    </div>
  );
}