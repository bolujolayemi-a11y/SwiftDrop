import React from 'react';

export default function Providers({ children }) {
  return (
    <div className="min-h-screen bg-brand-bg text-white relative selection:bg-brand-accent selection:text-white">
      {children}
    </div>
  );
}