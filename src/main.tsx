import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/index.css';
import { WalletProvider } from './shared/contexts/WalletContext';
import { Buffer } from 'buffer';
import { DownloadProvider } from './components/molecules/DownloadManager';
import StartupFlow from './app/StartupFlow';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Create a root wrapper component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <DownloadProvider>
        <StartupFlow />
      </DownloadProvider>
    </WalletProvider>
  </React.StrictMode>,
);
