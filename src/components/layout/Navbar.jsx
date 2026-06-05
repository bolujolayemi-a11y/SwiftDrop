import React, { useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { Zap, Menu, X, BookOpen, Shield, Home } from 'lucide-react';

export default function Navbar({ onNavigate, currentPage }) {
  const { user } = useTelegram();
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = (targetView) => {
    setIsOpen(false);
    onNavigate(targetView);
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 py-1.5 flex flex-col justify-center border-t-0 border-x-0 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 w-full">
      <div className="flex items-center justify-between w-full">
        
        {/* Brand Logo Anchor Section */}
        <div className="flex items-center gap-2 cursor-pointer py-1" onClick={() => handleMenuClick('home')}>
          <div className="h-7 w-7 rounded-md bg-brand-accent flex items-center justify-center shadow-md shadow-brand-accent/20">
            <Zap className="h-3.5 w-3.5 text-white fill-white" />
          </div>
          <span className="font-bold tracking-tight text-sm bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            SwiftDrop
          </span>
        </div>
        
        {/* Right Navigation Controls */}
        <div className="flex items-center gap-4">
          
          {/* 🖥️ Desktop Navigation Links: Visible only on tablet/desktop screens, hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 font-medium text-xs">
            <button 
              onClick={() => handleMenuClick('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'guide' ? 'bg-brand-accent/10 text-brand-accent' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> <span>User Guide</span>
            </button>
            <button 
              onClick={() => handleMenuClick('privacy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'privacy' ? 'bg-brand-accent/10 text-brand-accent' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Shield className="h-3.5 w-3.5" /> <span>Privacy Policy</span>
            </button>
          </div>

          {/* User Profile Deck */}
          {user && (
            <div 
              onClick={() => handleMenuClick('dashboard')}
              className={`flex items-center gap-1.5 bg-zinc-900/60 border rounded-full pl-1.5 pr-2.5 py-0.5 cursor-pointer transition-all hover:bg-zinc-900 ${
                currentPage === 'dashboard' ? 'border-brand-accent text-white' : 'border-zinc-800/80 text-zinc-400'
              }`}
            >
              <img 
                src={user.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
                alt={user.first_name} 
                className="h-4 w-4 rounded-full object-cover border border-zinc-800"
              />
              <span className="text-[11px] font-medium tracking-tight">@{user.username || "User"}</span>
            </div>
          )}

          {/* 📱 Mobile Hamburger Trigger: Hidden completely on desktop screens via md:hidden */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Hamburger Dropdown Drawer Panel: Kept tight and responsive for small screen layers */}
      {isOpen && (
        <div className="w-full md:hidden pt-2 pb-1.5 space-y-1 animate-reveal border-t border-white/5 mt-1.5 font-medium text-xs">
          <button 
            onClick={() => handleMenuClick('home')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-left ${
              currentPage === 'home' ? 'bg-brand-accent/10 text-brand-accent' : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <Home className="h-3.5 w-3.5" /> <span> Home</span>
          </button>
          
          <button 
            onClick={() => handleMenuClick('guide')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-left ${
              currentPage === 'guide' ? 'bg-brand-accent/10 text-brand-accent' : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> <span>User Guide</span>
          </button>

          <button 
            onClick={() => handleMenuClick('privacy')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-left ${
              currentPage === 'privacy' ? 'bg-brand-accent/10 text-brand-accent' : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <Shield className="h-3.5 w-3.5 " /> <span>Privacy Policy</span>
          </button>
        </div>
      )}
    </nav>
  );
}