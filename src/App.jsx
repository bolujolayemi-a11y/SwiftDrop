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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initApp = () => {
      try {
        const webApp = window.Telegram?.WebApp;

        const rawStartParam =
          webApp?.initDataUnsafe?.start_param ||
          tg?.initDataUnsafe?.start_param ||
          new URLSearchParams(window.location.search).get('startapp') ||
          new URLSearchParams(window.location.search).get('tgWebAppStartParam');

        if (rawStartParam) {
          const stringParam = String(rawStartParam).trim();
          
          
          const numericMatch = stringParam.match(/\d+/);
          const finalId = numericMatch ? `drop-${numericMatch[0]}` : stringParam;

          console.log("🎯 Pure Extracted Direct Claim ID Key:", finalId);

          setCurrentDropId(finalId);

          
          setCurrentPage('claim');
          setInitialized(true);
          return;
        }

        setInitialized(true);
      } catch (err) {
        console.error('App init error:', err);
        setInitialized(true);
      }
    };

    const timer = setTimeout(initApp, 150);
    return () => clearTimeout(timer);
  }, [tg]);

  const handleNavigation = (page, params = null) => {
    setCurrentPage(page);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!initialized) return null;

  return (
    <Providers>
      <PageWrapper>
        {currentPage !== 'claim' && currentPage !== 'deeplink' && (
          <Navbar onNavigate={handleNavigation} currentPage={currentPage} />
        )}

        <Router
          currentPage={currentPage}
          onNavigate={handleNavigation}
          currentDropId={currentDropId}
          setDropId={setCurrentDropId}
          params={routeParams}
        />
      </PageWrapper>
    </Providers>
  );
}