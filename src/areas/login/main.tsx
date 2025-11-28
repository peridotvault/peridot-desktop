import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@shared/assets/styles/index.css';
import { Buffer } from 'buffer';
import { WalletProvider } from '@shared/contexts/WalletContext';
import router from './app/routes';
import { StartupStageProvider } from '@shared/contexts/StartupStageContext';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <StartupStageProvider stage="login">
        <RouterProvider router={router} />
      </StartupStageProvider>
    </WalletProvider>
  </React.StrictMode>,
);
