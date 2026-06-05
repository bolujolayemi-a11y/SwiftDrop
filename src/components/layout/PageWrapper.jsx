import React from 'react';
import GlowOrb from '@/components/ui/GlowOrb';

export default function PageWrapper({ children }) {
  return (
    /* Outer Container: Spans the full height and width of the browser window */
    <div className="w-full min-h-screen bg-brand-bg text-white relative overflow-x-hidden antialiased selection:bg-brand-accent selection:text-white">
      
      {/* High-Fidelity Ambient Backdrop Highlights */}
      <GlowOrb className="-top-40 -left-40 w-[600px] h-[600px] opacity-20" />
      <GlowOrb className="top-1/4 -right-40 w-[700px] h-[700px] opacity-15" />
      <GlowOrb className="-bottom-20 left-1/3 w-[500px] h-[500px] opacity-10" />
      
      {/* Central Layout Column:
          - Automatically spans edge-to-edge (100% width) on mobile and Telegram.
          - Gently bounds the layout max-width to 1200px (standard premium dashboard width like Stripe/Linear) on huge desktop views.
      */}
      <div className="w-full max-w-6xl mx-auto min-h-screen flex flex-col justify-start relative z-10 px-4 sm:px-6 lg:px-8 pb-12">
        {children}
      </div>
    </div>
  );
}