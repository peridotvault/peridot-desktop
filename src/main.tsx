import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/index.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { WalletProvider } from './contexts/WalletContext';
import { Buffer } from 'buffer';

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
      <Root />
    </WalletProvider>
  </React.StrictMode>,
);

// Use contextBridge
// window.ipcRenderer.on("main-process-message", (_event, message) => {
//   console.log(message);
// });
