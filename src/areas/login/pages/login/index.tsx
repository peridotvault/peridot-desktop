import { useEffect, useMemo, useRef } from 'react';
import walletHtml from '@antigane/peridotwallet-runtime/login?url';
import { useWallet } from '@shared/contexts/WalletContext';
import { redirectToMain } from '@shared/desktop/windowControls';
import { getPeridotRuntimeWallet } from '@shared/services/peridot-runtime';
import { saveWalletData } from '@shared/services/store';
import { hasRuntimeWalletData } from '@shared/services/wallet';

export interface LoginScreenProps {
  onAuthenticated?: () => void;
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const { wallet, setWallet } = useWallet();
  const redirectRequestedRef = useRef(false);

  const hasRuntimeWallet = useMemo(() => hasRuntimeWalletData(wallet), [wallet]);
  const hasAnyWallet = hasRuntimeWallet;

  useEffect(() => {
    if (!hasAnyWallet) {
      return;
    }

    if (redirectRequestedRef.current) {
      return;
    }

    redirectRequestedRef.current = true;
    onAuthenticated?.();
    redirectToMain();
  }, [hasAnyWallet, onAuthenticated]);

  useEffect(() => {
    if (hasAnyWallet) {
      return;
    }

    let isMounted = true;

    const syncRuntimeWallet = async () => {
      const runtimeWallet = await getPeridotRuntimeWallet();

      if (!isMounted || !runtimeWallet || redirectRequestedRef.current) {
        return;
      }

      redirectRequestedRef.current = true;

      let nextWallet = wallet;

      setWallet((previousWallet) => {
        nextWallet = {
          ...previousWallet,
          runtimeWallet,
        };

        return nextWallet;
      });

      await saveWalletData(nextWallet);
      onAuthenticated?.();
      redirectToMain();
    };

    void syncRuntimeWallet();

    const intervalId = window.setInterval(() => {
      void syncRuntimeWallet();
    }, 1000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [hasAnyWallet, setWallet, wallet]);

  return (
    <main data-tauri-drag-region className="h-dvh w-full overflow-hidden bg-black">
      <iframe
        title="Peridot Wallet Login"
        src={walletHtml}
        className="h-full w-full border-0"
      />
    </main>
  );
}
