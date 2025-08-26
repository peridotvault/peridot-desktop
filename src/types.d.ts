// types.d.ts
import type { WalletData } from './features/wallet/services/WalletService';

declare global {
  interface Window {
    electronAPI: {
      goBack: () => void;
      goForward: () => void;
      saveWallet: (
        data: SerializedWalletData | WalletData,
      ) => Promise<{ success: boolean; error?: string }>;
      getWallet: () => Promise<{ success: boolean; data?: SerializedWalletData; error?: string }>;
      clearWallet: () => Promise<{ success: boolean; error?: string }>;
      openWebGame: (url: string) => void;
    };
  }
}
