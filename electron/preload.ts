import { ipcRenderer } from 'electron'
import type { WalletData } from '../src/utils/WalletService'
import { EncryptedData } from '../src/utils/AntiganeEncrypt';

interface SerializedWalletData {
  // Add your serialized wallet data properties here based on your WalletData type
  encryptedSeedPhrase: EncryptedData | null;
    principalId: string | null;
    accountId: string | null;
    encryptedPrivateKey: EncryptedData | null;
    password: string | null;
}

// Attach electronAPI methods with types matching types.d.ts
window.electronAPI = {
  saveWallet: (data: SerializedWalletData | WalletData): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('save-wallet', data),
    
  getWallet: (): Promise<{ success: boolean; data?: SerializedWalletData; error?: string }> => 
    ipcRenderer.invoke('get-wallet'),
    
  clearWallet: (): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('clear-wallet')
}