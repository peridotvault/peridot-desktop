import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@shared/assets/styles/index.css';
import { WalletProvider } from '@shared/contexts/WalletContext';
import { Buffer } from 'buffer';
import { DownloadProvider } from '@components/molecules/DownloadManager';
import router from './app/routes';
import { StartupStageProvider } from '@shared/contexts/StartupStageContext';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Create a root wrapper component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <DownloadProvider>
        <StartupStageProvider stage="app">
          <RouterProvider router={router} />
        </StartupStageProvider>
      </DownloadProvider>
    </WalletProvider>
  </React.StrictMode>,
);
