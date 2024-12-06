import { ipcMain } from 'electron';
import Store from 'electron-store';
import {  SerializedWalletData, WalletData } from '../src/utils/WalletService';

// Make store persistent
const store = new Store({
  name: 'wallet-data', // Give a specific name to your store file
  clearInvalidConfig: true, // Clear if the store structure is invalid
  defaults: {
    wallet: {
      seedPhrase: null,
      principalId: null,
      accountId: null,
      privateKey: null,
      password: null,
    },
  },
});

export const setupStoreHandlers = () => {
  // Handler to get initial data when app starts
  ipcMain.handle('get-initial-data', async () => {
    try {
      const data = store.get('wallet');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('save-wallet', async (_, data: WalletData | SerializedWalletData) => {
    try {
      store.set('wallet', data);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('get-wallet', async () => {
    try {
      const data = store.get('wallet');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('clear-wallet', async () => {
    try {
      store.delete('wallet');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
};