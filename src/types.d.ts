import type { WalletData } from "./utils/WalletService";

declare global {
  interface Window {
    electronAPI: {
      saveWallet: (data: SerializedWalletData | WalletData) => Promise<{ success: boolean; error?: string }>;
      getWallet: () => Promise<{ success: boolean; data?: SerializedWalletData; error?: string }>;
      clearWallet: () => Promise<{ success: boolean; error?: string }>;
    }
  }
}