import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/index.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { WalletProvider } from './contexts/WalletContext';
import { Buffer } from 'buffer';
import { DownloadProvider } from './components/molecules/DownloadManager';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Create a root wrapper component
const Root = () => {
  return <RouterProvider router={router} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <DownloadProvider>
        <Root />
      </DownloadProvider>
    </WalletProvider>
  </React.StrictMode>,
);
