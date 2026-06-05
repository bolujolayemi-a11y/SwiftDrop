import React, { useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ onBack, fallbackText = "Back" }) {
  // Grab the context safely to prevent destructuring crashes on desktop
  const telegramContext = useTelegram() || {};
  const { tg, triggerHaptic, setupNativeBackButton } = telegramContext;

  // Safely hook into Telegram's native top-bar back arrow only if the function exists
  useEffect(() => {
    if (typeof setupNativeBackButton === 'function') {
      const handleBackAction = () => {
        if (typeof triggerHaptic === 'function') triggerHaptic('light');
        onBack();
      };

      const cleanup = setupNativeBackButton(handleBackAction);
      return cleanup;
    }
  }, [tg, setupNativeBackButton, onBack]);

  // If the native Telegram WebApp interface has already drawn its own back arrow,
  // we return null to completely hide our on-screen fallback button.
  if (tg?.BackButton?.isVisible) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-start py-1">
      <button
        type="button"
        onClick={() => { 
          if (typeof triggerHaptic === 'function') triggerHaptic('light'); 
          onBack(); 
        }}
        className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-400 hover:text-white transition-all duration-200 bg-zinc-900/60 hover:bg-zinc-900 border border-white/[0.04] hover:border-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md active:scale-95 shadow-xs cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
        <span>{fallbackText}</span>
      </button>
    </div>
  );
}