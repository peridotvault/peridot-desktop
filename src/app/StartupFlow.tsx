import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { RouterProvider } from 'react-router-dom';
import UpdaterPage from '../pages/additional/UpdaterPage';
import { LoginScreen } from '../pages/signin/Login';
import router from './routes';
import { useWallet } from '../shared/contexts/WalletContext';
import { LoadingScreen } from '../components/organisms/LoadingScreen';
import { StartupStage, StartupStageContext } from '../shared/contexts/StartupStageContext';
import type { WindowRole } from '../shared/desktop/windowControls';
import {
  getWindowRole,
  isDesktopRuntime,
  listenLoginWindowStageChange,
  resolveDesktopWindowRole,
  showLoginWindow,
  showMainWindow,
} from '../shared/desktop/windowControls';

const isWalletReady = (wallet: ReturnType<typeof useWallet>['wallet']) =>
  Boolean(
    wallet.principalId && wallet.accountId && wallet.encryptedPrivateKey && wallet.verificationData,
  );

const getWebInitialStage = (): StartupStage =>
  'undefined' !== typeof window ? 'login' : 'updater';
const getInitialStageForRole = (role: WindowRole): StartupStage => {
  if (role === 'login') {
    return 'updater';
  }
  if (role === 'web') {
    return getWebInitialStage();
  }
  return 'app';
};

export default function StartupFlow() {
  const { wallet, isCheckingWallet } = useWallet();
  const [windowRole, setWindowRole] = useState<WindowRole>(() => getWindowRole());
  const isDesktop = isDesktopRuntime();
  const isLoginWindow = windowRole === 'login';
  const isWebRuntime = windowRole === 'web';
  const [stage, setStage] = useState<StartupStage>(() => getInitialStageForRole(windowRole));

  const hasWallet = useMemo(() => isWalletReady(wallet), [wallet]);

  const proceedToNextStage = useCallback(() => {
    setStage((prev) => {
      if (prev === 'updater') {
        return hasWallet ? 'app' : 'login';
      }
      return prev;
    });
  }, [hasWallet]);

  useEffect(() => {
    if (!(isLoginWindow || isWebRuntime)) {
      return;
    }
    if (stage === 'login' && hasWallet && !isCheckingWallet) {
      setStage('app');
    }
  }, [hasWallet, isCheckingWallet, isLoginWindow, isWebRuntime, stage]);

  useEffect(() => {
    if (!isDesktop) {
      return;
    }
    let disposed = false;
    resolveDesktopWindowRole()
      .then((role) => {
        if (disposed) {
          return;
        }
        setWindowRole(role);
        if (role === 'login') {
          setStage((prev) => (prev === 'app' ? 'updater' : prev));
        }
      })
      .catch(() => {
        /* noop */
      });
    return () => {
      disposed = true;
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop || !isLoginWindow || stage !== 'app') {
      return;
    }
    showMainWindow();
  }, [isDesktop, isLoginWindow, stage]);

  useEffect(() => {
    if (!isLoginWindow || !isDesktop) {
      return;
    }
    let dispose: (() => void) | undefined;
    listenLoginWindowStageChange((nextStage) => {
      setStage(nextStage);
    }).then((unlisten) => {
      dispose = unlisten;
    });
    return () => {
      dispose?.();
    };
  }, [isDesktop, isLoginWindow]);

  useEffect(() => {
    if (!isWebRuntime) {
      return;
    }
    if (stage === 'app' && window.location.hash === '#/updater') {
      window.location.hash = '#/';
    }
  }, [isWebRuntime, stage]);

  const goToLogin = useCallback(() => {
    if (isLoginWindow || !isDesktop) {
      setStage('login');
      return;
    }
    void showLoginWindow('login');
  }, [isDesktop, isLoginWindow]);

  const goToUpdater = useCallback(() => {
    if (isLoginWindow || !isDesktop) {
      setStage('updater');
      return;
    }
    void showLoginWindow('updater');
  }, [isDesktop, isLoginWindow]);

  const goToApp = useCallback(() => {
    if (isLoginWindow || !isDesktop) {
      setStage('app');
      return;
    }
    void showMainWindow();
  }, [isDesktop, isLoginWindow]);

  const stageContextValue = useMemo(
    () => ({
      stage,
      goToLogin,
      goToUpdater,
      goToApp,
    }),
    [goToApp, goToLogin, goToUpdater, stage],
  );

  let content: ReactNode = null;

  if (isLoginWindow) {
    if (stage === 'updater') {
      content = <UpdaterPage onContinue={proceedToNextStage} />;
    } else if (stage === 'login' && isCheckingWallet) {
      content = <LoadingScreen />;
    } else if (stage === 'login') {
      content = <LoginScreen onAuthenticated={() => setStage('app')} />;
    } else {
      content = (
        <div className="w-full h-screen flex flex-col gap-4 items-center justify-center bg-background_primary text-foreground">
          <p className="text-lg font-semibold">Launching PeridotVault…</p>
        </div>
      );
    }
  } else if (isWebRuntime) {
    if (stage === 'updater') {
      content = <UpdaterPage onContinue={proceedToNextStage} />;
    } else if (stage === 'login' && isCheckingWallet) {
      content = <LoadingScreen />;
    } else if (stage === 'login') {
      content = <LoginScreen onAuthenticated={() => setStage('app')} />;
    } else {
      content = <RouterProvider router={router} />;
    }
  } else {
    if (isCheckingWallet) {
      content = <LoadingScreen />;
    } else if (!hasWallet) {
      content = (
        <div className="w-full h-screen flex flex-col gap-4 items-center justify-center bg-background_primary text-foreground">
          <p className="text-lg font-semibold">
            Please login through the PeridotVault Login window.
          </p>
        </div>
      );
    } else {
      content = <RouterProvider router={router} />;
    }
  }

  return (
    <StartupStageContext.Provider value={stageContextValue}>{content}</StartupStageContext.Provider>
  );
}
