import React, { useState, useEffect } from 'react';
import Providers from '@/app/providers';
import Navbar from '@/components/layout/Navbar';
import PageWrapper from '@/components/layout/PageWrapper';
import Router from '@/app/router';
import { useTelegram } from '@/hooks/useTelegram';

export default function App() {
  const { tg } = useTelegram();
  const [currentPage, setCurrentPage] = useState('home');
  const [currentDropId, setCurrentDropId] = useState('drop-alpha');
  const [routeParams, setRouteParams] = useState(null);

  // 🚀 FIXED ADAPTATION LAYER: Catches Telegram Deep Links & Vercel URL Parameters
  useEffect(() => {
    // 🤖 1. Check if running inside the live Telegram Mini App sandbox context
    if (tg?.initDataUnsafe?.start_param) {
      const targetId = tg.initDataUnsafe.start_param;
      console.log(`🎯 Telegram startup parameter caught: ${targetId}`);
      setCurrentDropId(targetId);
      setCurrentPage('campaign-detail'); // Slide them straight to the target view
    } 
    // 🌐 2. Standalone Web Fallback: Parse URL parameters if running on standard Vercel browser tabs
    else {
      const urlParams = new URLSearchParams(window.location.search);
      const dropIdFromUrl = urlParams.get('dropId');
      if (dropIdFromUrl) {
        console.log(`🌐 Web URL parameter caught: ${dropIdFromUrl}`);
        setCurrentDropId(dropIdFromUrl);
        setCurrentPage('campaign-detail');
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