// preload.ts
import { ipcRenderer } from 'electron'
import type { WalletData } from '../src/features/wallet/services/WalletService'
import { EncryptedData } from '@antigane/encryption';

interface SerializedWalletData {
  encryptedSeedPhrase: EncryptedData | null;
  principalId: string | null;
  accountId: string | null;
  encryptedPrivateKey: EncryptedData | null;
  password: string | null;
}
// Attach electronAPI methods with types matching types.d.ts
window.electronAPI = {
  goBack: (): void => {
    ipcRenderer.send('go-back');
  },
  goForward: (): void => {
    ipcRenderer.send('go-forward');
  },

  // wallet 
  saveWallet: (data: SerializedWalletData | WalletData): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-wallet', data),

  getWallet: (): Promise<{ success: boolean; data?: SerializedWalletData; error?: string }> =>
    ipcRenderer.invoke('get-wallet'),

  clearWallet: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('clear-wallet'),


  openWebGame: (url: string): void => {
    ipcRenderer.send('open-web-game', url);
  },
}