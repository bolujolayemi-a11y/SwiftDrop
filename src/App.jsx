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
  const returnState = sessionStorage.getItem('returnFromWithdraw');

if (returnState) {
  const parsed = JSON.parse(returnState);

  sessionStorage.removeItem('returnFromWithdraw');

  if (parsed?.dropId) {
    setCurrentDropId(parsed.dropId);
    setCurrentPage(parsed.page || 'claim'); // 👈 THIS IS THE KEY FIX
    setInitialized(true);
    return;
  }
}

  useEffect(() => {
    const detectDeepLink = () => {
      try {
        const webApp = window.Telegram?.WebApp;

        const startParam =
          webApp?.initDataUnsafe?.start_param ||
          tg?.initDataUnsafe?.start_param;

        if (startParam) {
          setCurrentDropId(startParam);
          dropStore.incrementClickCount?.(startParam);
          setCurrentPage('deeplink');
          setInitialized(true);
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);

        const webStartParam =
          urlParams.get('startapp') ||
          urlParams.get('dropId');

        if (webStartParam) {
          setCurrentDropId(webStartParam);
          dropStore.incrementClickCount?.(webStartParam);
          setCurrentPage('deeplink');
          setInitialized(true);
          return;
        }

        setInitialized(true);
      } catch (err) {
        console.error('Deep link error:', err);
        setInitialized(true);
      }
    };

    const timer = setTimeout(detectDeepLink, 300);
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
        {currentPage !== 'deeplink' && (
          <Navbar
            onNavigate={handleNavigation}
            currentPage={currentPage}
          />
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