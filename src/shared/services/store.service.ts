import { WalletData } from './wallet.service';
import { getKvItem, setKvItem, deleteKvItem } from '@shared/storage/app-db';
import { KV_KEYS } from '@shared/storage/kv-keys';

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
