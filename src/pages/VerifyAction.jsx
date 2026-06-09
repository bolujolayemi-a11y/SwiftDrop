import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { useTelegram } from '@/hooks/useTelegram';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { ShieldCheck, HelpCircle, AlertCircle, Share2, CheckCircle2 } from 'lucide-react';

export default function VerifyAction({ id, onNavigate }) {
  const { tg, triggerHaptic } = useTelegram();
  const drop = dropStore.getDropById(id);
  
  // 💾 State keys unique to this specific drop ID context to prevent crossover bugs
  const storageKeys = {
    trivia: `swifty_verify_trivia_${id}`,
    share: `swifty_verify_share_${id}`
  };

  // Hydrate states instantly from localStorage, falling back to clean defaults
  const [selectedOption, setSelectedOption] = useState(() => {
    const saved = localStorage.getItem(storageKeys.trivia);
    return saved !== null ? parseInt(saved, 10) : null;
  });
  
  const [hasShared, setHasShared] = useState(() => {
    return localStorage.getItem(storageKeys.share) === 'true';
  });

  const [isSharing, setIsSharing] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);

  // Sync state variables to localStorage whenever mutated
  useEffect(() => {
    if (selectedOption !== null) {
      localStorage.setItem(storageKeys.trivia, selectedOption);
    }
  }, [selectedOption, storageKeys.trivia]);

  useEffect(() => {
    if (hasShared) {
      localStorage.setItem(storageKeys.share, 'true');
    }
  }, [hasShared, storageKeys.share]);

  if (!drop) {
    return (
      <div className="text-center py-12 space-y-4 max-w-md mx-auto px-4">
        <p className="text-zinc-400 text-sm">We couldn't find the details for this reward pool.</p>
        <Button onClick={() => onNavigate('home')}>Go Back Home</Button>
      </div>
    );
  }

  const needsTrivia = !!drop.trivia;

  const handleTelegramShare = () => {
    setIsSharing(true);
    triggerHaptic('impact');

    const shareUrl = `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=Claim your share of the ${encodeURIComponent(drop.title)} pool instantly on SwiftDrop! 🚀`;

    if (tg?.openLink) {
      tg.openLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }

    setHasShared(true);
  };

    const handleVerifySubmission = () => {
    if (needsTrivia && selectedOption === null) return;
    if (!hasShared) return;

    if (needsTrivia && selectedOption !== drop.trivia.correctIndex) {
      triggerHaptic('warning');
      setErrorStatus(true);
      return;
    }

    triggerHaptic('success');
    setErrorStatus(false);

    // cleanup
    localStorage.removeItem(storageKeys.trivia);
    localStorage.removeItem(storageKeys.share);

    // ✅ SAVE VERIFICATION STATE
    sessionStorage.setItem(
      `swifty_verified_${id}`,
      JSON.stringify({
        dropId: id,
        verified: true,
        timestamp: Date.now()
      })
    );

    onNavigate('claim');
  };

  const isButtonDisabled = (needsTrivia && selectedOption === null) || !hasShared;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-2 flex flex-col justify-between min-h-[80vh] animate-reveal text-zinc-100">
      
      {/* Layout Header Area */}
      <div className="space-y-4 w-full text-center">
        <div className="text-left">
          <BackButton onBack={() => onNavigate('details')} fallbackText="Cancel" />
        </div>

        <div className="pt-2 space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-wider mx-auto">
            <ShieldCheck className="h-3 w-3" /> Anti-Bot Verification
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white px-2 tracking-tight leading-tight">Complete Tasks</h2>
          <p className="text-xs md:text-sm text-zinc-400 max-w-sm mx-auto">
            Finish the secure requirements below to verify human routing and claim your asset slots.
          </p>
        </div>
      </div>

      {/* Main Requirement Canvas */}
      <div className="max-w-xl mx-auto w-full my-auto py-6 space-y-4">
        {/* Step 1: Interactive Question Card */}
        {needsTrivia && (
          <GlassCard className="bg-linear-to-br from-zinc-950 to-zinc-900/40 space-y-4 border-white/5 rounded-2xl p-5">
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-mono text-brand-accent items-center justify-center font-bold shrink-0 mt-0.5">1</span>
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-semibold text-zinc-200 leading-relaxed flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-brand-accent shrink-0" /> Answer the Question
                </h3>
                <p className="text-xs text-zinc-400 pt-0.5 leading-relaxed">{drop.trivia.question}</p>
              </div>
            </div>

            <div className="space-y-2 pt-1 w-full">
              {drop.trivia.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => { setSelectedOption(index); setErrorStatus(false); triggerHaptic('light'); }}
                  className={`p-3.5 rounded-xl border text-xs font-medium duration-150 cursor-pointer transition-all ${
                    selectedOption === index
                      ? 'bg-brand-accent/10 border-brand-accent text-white shadow-md'
                      : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Step 2: Viral Share Loop Card */}
        <GlassCard className={`p-5 space-y-3 transition-all duration-300 rounded-2xl border ${
          hasShared ? 'border-brand-success/20 bg-brand-success/5 shadow-inner' : 'border-white/5 bg-linear-to-br from-zinc-950 to-zinc-900/40'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5 text-left">
              <span className={`flex h-5 w-5 rounded-full text-[10px] font-mono items-center justify-center font-bold shrink-0 mt-0.5 ${
                hasShared ? 'bg-brand-success/20 border-brand-success/30 text-brand-success' : 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent'
              }`}>
                {needsTrivia ? '2' : '1'}
              </span>
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-zinc-200">Share with Friends</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Forward this reward pool link to an active Telegram workspace group or channel profile.
                </p>
              </div>
            </div>
            
            {hasShared && <CheckCircle2 className="h-5 w-5 text-brand-success shrink-0 mt-0.5 animate-reveal" />}
          </div>

          <button
            type="button"
            onClick={handleTelegramShare}
            disabled={hasShared}
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer duration-200 active:scale-[0.99] transition-all border ${
              hasShared
                ? 'bg-zinc-900/40 border-white/5 text-zinc-500 cursor-not-allowed'
                : 'bg-white text-black border-transparent hover:bg-zinc-200 shadow-lg'
          }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{isSharing ? 'Sharing Link...' : hasShared ? 'Shared Successfully' : 'Share on Telegram'}</span>
          </button>
        </GlassCard>

        {errorStatus && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-400 animate-reveal">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Incorrect criteria answer. Please analyze your options and retry!</span>
          </div>
        )}
      </div>

      {/* Main Verification Trigger CTA */}
      <div className="pt-4 pb-2 max-w-xl mx-auto w-full">
        <Button 
          disabled={isButtonDisabled} 
          onClick={handleVerifySubmission}
          className="w-full py-3.5 text-xs font-bold transition-all relative overflow-hidden group"
        >
          {!isButtonDisabled && (
            <div className="absolute inset-0 bg-linear-to-r from-brand-accent via-blue-600 to-brand-accent transition-all duration-300 group-hover:opacity-90" />
          )}
          <span className="relative z-10">Verify Tasks & Continue</span>
        </Button>
      </div>

    </div>
  );
}