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

export default function Router({ currentPage, onNavigate, currentDropId, setDropId, params }) {
  
  switch (currentPage) {
    case 'home':
      return <Home onNavigate={onNavigate} setDropId={setDropId} />;
      
    case 'create':
      return <CreateDrop onNavigate={onNavigate} />;
      
    case 'dashboard':
      return <Dashboard onNavigate={onNavigate} setDropId={setDropId} />;
      
    // 🚀 FIXED: Injected setDropId so inner links can handle deep param caching loops safely
    case 'details':
      return <DropDetails id={currentDropId} onNavigate={onNavigate} setDropId={setDropId} />;
      
    // 🚀 FIXED: Injected setDropId to persist drop context when a user jumps out to look at the global leaderboard
    case 'claim':
      return <ClaimReward id={currentDropId} onNavigate={onNavigate} setDropId={setDropId} />;
      
    // 🚀 FIXED: Updated to match your 'verify-action' routing state naming token used inside App.jsx and DropDetails.jsx
    case 'verify-action':
    case 'verify':
      return <VerifyAction id={currentDropId} onNavigate={onNavigate} />;
      
    case 'analytics':
      return <CampaignAnalytics id={currentDropId} onNavigate={onNavigate} />;
      
    case 'gatekeeper':
      return <Gatekeeper id={currentDropId} onNavigate={onNavigate} setDropId={setDropId} />;
    
    case 'guide':
      return <UserGuide onNavigate={onNavigate} />;
      
    case 'privacy':
      return <PrivacyPolicy onNavigate={onNavigate} />;
    
    // 🏆 Leaderboard State Stack: Contextually bound to the claim instance it branched from
    case 'leaderboard':
      return (
        <Leaderboard 
          onNavigate={onNavigate} 
          dropId={currentDropId}
          params={params} 
        />
      );
      
    default:
      return <Home onNavigate={onNavigate} setDropId={setDropId} />;
  }
}