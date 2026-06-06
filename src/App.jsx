import React, { useState, useEffect } from 'react';
import Providers from '@/app/providers';
import Navbar from '@/components/layout/Navbar';
import PageWrapper from '@/components/layout/PageWrapper';
import Router from '@/app/router';
import { useTelegram } from '@/hooks/useTelegram';
import { dropStore } from '@/features/drops/dropStore';

export default function App() {
  const { tg } = useTelegram();
  const [currentPage, setCurrentPage] = useState('home');
  const [currentDropId, setCurrentDropId] = useState(null);
  const [routeParams, setRouteParams] = useState(null);

  // 🚀 FIXED ADAPTATION LAYER: Catches Telegram Deep Links & Vercel URL Parameters
  useEffect(() => {
    // 🤖 1. Check if running inside the live Telegram Mini App sandbox context
    const tgStartParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param || tg?.initDataUnsafe?.start_param;

    if (tgStartParam) {
      console.log(`🎯 Telegram startup parameter caught: ${tgStartParam}`);
      
      // 💾 Lock the drop ID into global memory state
      setCurrentDropId(tgStartParam);
      
      // 📈 Automatically fire the analytics counter click tracking loop
      if (dropStore.incrementClickCount) {
        dropStore.incrementClickCount(tgStartParam);
      }
      
      // 🎯 FIXED: Direct route targeting must match your 'details' route token case
      setCurrentPage('details'); 
    } 
    // 🌐 2. Standalone Web Fallback: Parse URL parameters if running on standard Vercel browser tabs
    else {
      const urlParams = new URLSearchParams(window.location.search);
      const webStartParam = urlParams.get('startapp') || urlParams.get('dropId');
      
      if (webStartParam) {
        console.log(`🌐 Web URL parameter caught: ${webStartParam}`);
        setCurrentDropId(webStartParam);
        
        if (dropStore.incrementClickCount) {
          dropStore.incrementClickCount(webStartParam);
        }
        
        setCurrentPage('details');
      }
    }
  }, [tg]);

  const handleNavigation = (pageTarget, params = null) => {
    setCurrentPage(pageTarget);
    setRouteParams(params); // 💾 Save the incoming data object (amount, token, etc.)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Providers>
      <PageWrapper>
        {/* Hide Navbar inside Telegram bot context to keep the UI super clean and native */}
        {(!tg || !tg.initDataUnsafe?.start_param) && (
          <Navbar onNavigate={handleNavigation} currentPage={currentPage} />
        )}
        
        <Router 
          currentPage={currentPage} 
          onNavigate={handleNavigation} 
          currentDropId={currentDropId}
          setDropId={setCurrentDropId}
          params={routeParams} // 🚀 Pass the saved parameters right into your router switchboard!
        />
      </PageWrapper>
    </Providers>
  );
}