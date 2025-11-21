import React from 'react';
import ReactDOM from 'react-dom/client';
import '@shared/assets/styles/index.css';
import { Buffer } from 'buffer';
import { WalletProvider } from '@shared/contexts/WalletContext';
import StartupFlow from '@main/app/StartupFlow';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <StartupFlow />
    </WalletProvider>
  </React.StrictMode>,
);
