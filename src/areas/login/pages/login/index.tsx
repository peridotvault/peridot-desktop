// src/areas/login/pages/login.tsx (misal pathnya begini)
import { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import { ImportWallet } from '../import';
import { CreateWallet } from '../create';

export interface LoginScreenProps {
  onAuthenticated?: () => void;
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const { wallet } = useWallet();
  const [isImportWallet, setIsImportWallet] = useState<boolean>(true);

  const hasWallet = useMemo(
    () =>
      Boolean(
        wallet.principalId &&
          wallet.accountId &&
          wallet.encryptedPrivateKey &&
          wallet.verificationData,
      ),
    [wallet],
  );

  useEffect(() => {
    if (hasWallet) {
      onAuthenticated?.();
    }
  }, [hasWallet, onAuthenticated]);

  return (
    <main data-tauri-drag-region className="flex justify-center w-full h-dvh items-center gap-6">
      <div data-tauri-drag-region className="flex w-full h-full max-w-[1200px]">
        <section data-tauri-drag-region className="w-1/2 h-full flex items-center justify-center">
          <h1 data-tauri-drag-region className="text-8xl font-bold">
            Welcome
          </h1>
        </section>

        <section data-tauri-drag-region className="w-1/2 h-full flex items-center justify-center">
          {isImportWallet ? (
            <ImportWallet setIsImportWallet={setIsImportWallet} />
          ) : (
            <CreateWallet setIsImportWallet={setIsImportWallet} />
          )}
        </section>
      </div>
    </main>
  );
}
