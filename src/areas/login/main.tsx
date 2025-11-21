import React from 'react';
import ReactDOM from 'react-dom/client';
import '@shared/assets/styles/index.css';
import { Buffer } from 'buffer';
import { App } from './App';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Create a root wrapper component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
