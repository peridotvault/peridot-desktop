import { WalletData } from './wallet';
import { getKvItem, setKvItem, deleteKvItem } from '@shared/database/app-db';
import { KV_KEYS } from '@shared/database/kv-keys';

export const saveWalletData = async (data: WalletData): Promise<void> => {
  try {
    await setKvItem(KV_KEYS.walletData, data);
  } catch (error) {
    console.error('Error saving wallet data:', error);
    throw error;
  }
};

export const getWalletData = async (): Promise<WalletData | undefined> => {
  try {
    const stored = await getKvItem<WalletData>(KV_KEYS.walletData);
    return stored ?? undefined;
  } catch (error) {
    console.error('Error getting wallet data:', error);
    return undefined;
  }
};

export const clearWalletData = async (): Promise<void> => {
  try {
    await deleteKvItem(KV_KEYS.walletData);
  } catch (error) {
    console.error('Error clearing wallet data:', error);
    throw error;
  }
};
