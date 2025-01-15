import { ipcMain } from 'electron';
import Store from 'electron-store';
import { WalletData } from '../src/utils/WalletService';

// Define the store schema to match WalletData
interface StoreSchema {
  wallet: WalletData;
}

// Make store persistent
const store = new Store<StoreSchema>({
  name: 'wallet-data',
  clearInvalidConfig: true,
  defaults: {
    wallet: {
      encryptedSeedPhrase: null,
      principalId: null,
      accountId: null,
      encryptedPrivateKey: null,
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

  // Update save-wallet handler to handle EncryptedData
  ipcMain.handle('save-wallet', async (_, data: WalletData) => {
    try {
      // Validate the structure before saving
      const validatedData: WalletData = {
        encryptedSeedPhrase: data.encryptedSeedPhrase,
        principalId: data.principalId,
        accountId: data.accountId,
        encryptedPrivateKey: data.encryptedPrivateKey,
        password: data.password,
      };

      store.set('wallet', validatedData);
      return { success: true };
    } catch (error) {
      console.error('Error saving wallet data:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Get wallet handler with type safety
  ipcMain.handle('get-wallet', async () => {
    try {
      const data = store.get('wallet');
      // Validate the structure of retrieved data
      if (data) {
        const validatedData: WalletData = {
          encryptedSeedPhrase: data.encryptedSeedPhrase,
          principalId: data.principalId,
          accountId: data.accountId,
          encryptedPrivateKey: data.encryptedPrivateKey,
          password: data.password,
        };
        return { success: true, data: validatedData };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error('Error getting wallet data:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Clear wallet handler
  ipcMain.handle('clear-wallet', async () => {
    try {
      store.delete('wallet');
      // Reset to default values
      store.set('wallet', {
        encryptedSeedPhrase: null,
        principalId: null,
        accountId: null,
        encryptedPrivateKey: null,
        password: null,
      });
      return { success: true };
    } catch (error) {
      console.error('Error clearing wallet data:', error);
      return { success: false, error: (error as Error).message };
    }
  });
};