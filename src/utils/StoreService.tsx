import { WalletData } from "./WalletService";

export const saveWalletData = async (data: WalletData): Promise<void> => {
  try {
    // Properly serialize the identity
    const serializedData = {
      ...data,
    };

    const result = await window.electronAPI.saveWallet(serializedData);
    if (!result.success) {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error saving wallet data:", error);
    throw error;
  }
};

export const getWalletData = async (): Promise<WalletData | undefined> => {
  try {
    const result = await window.electronAPI.getWallet();
    if (result.success && result.data) {
      const data = result.data;

      // Properly deserialize the identity
      const walletData: WalletData = {
        ...data,
      };

      return walletData;
    }
    return undefined;
  } catch (error) {
    console.error("Error getting wallet data:", error);
    return undefined;
  }
};

export const clearWalletData = async (): Promise<void> => {
  try {
    const result = await window.electronAPI.clearWallet();
    if (!result.success) {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error clearing wallet data:", error);
    throw error;
  }
};
