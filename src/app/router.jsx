import React from 'react';

import Home from '@/pages/Home';
import CreateDrop from '@/pages/CreateDrop';
import Dashboard from '@/pages/Dashboard';
import DropDetails from '@/pages/DropDetails';
import ClaimReward from '@/pages/ClaimReward';
import VerifyAction from '@/pages/VerifyAction';
import CampaignAnalytics from '@/pages/CampaignAnalytics';
import Gatekeeper from '@/pages/Gatekeeper';
import Leaderboard from '@/pages/Leaderboard';
import UserGuide from '@/pages/UserGuide';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import DeepLink from '@/pages/DeepLink';
import WalletOverview from '@/pages/WalletOverview';
import EarningsHistory from '@/pages/EarningsHistory';
import Withdrawals from '@/pages/Withdrawals';

export default function Router({
  currentPage,
  onNavigate,
  currentDropId,
  setDropId,
  params
}) {
  const commonProps = {
    onNavigate,
    setDropId
  };

  switch (currentPage) {
    case 'home':
      return <Home {...commonProps} />;

    case 'create':
      return <CreateDrop onNavigate={onNavigate} />;

    case 'dashboard':
      return <Dashboard {...commonProps} />;

    case 'details':
      return (
        <DropDetails
          id={currentDropId}
          onNavigate={onNavigate}
          setDropId={setDropId}
        />
      );

    case 'claim':
      return (
        <ClaimReward
          id={currentDropId}
          onNavigate={onNavigate}
        />
      );

    case 'deeplink':
      return (
        <DeepLink
          id={currentDropId}
          onNavigate={onNavigate}
        />
      );

    case 'verify-action':
    case 'verify':
      return (
        <VerifyAction
          id={currentDropId}
          onNavigate={onNavigate}
        />
      );

    case 'analytics':
      return (
        <CampaignAnalytics
          id={currentDropId}
          onNavigate={onNavigate}
        />
      );

    case 'gatekeeper':
      return (
        <Gatekeeper
          id={currentDropId}
          {...commonProps}
        />
      );

    case 'guide':
      return <UserGuide onNavigate={onNavigate} />;

    case 'privacy':
      return <PrivacyPolicy onNavigate={onNavigate} />;

    case 'wallet':
      return <WalletOverview {...commonProps} />;

    case 'earnings':
      return <EarningsHistory {...commonProps} />;

    case 'withdrawals':
      return <Withdrawals {...commonProps} />;

    case 'leaderboard':
  return (
    <Leaderboard
      onNavigate={onNavigate}
      dropId={currentDropId}
    />
  );

    default:
      return <Home {...commonProps} />;
  }
}