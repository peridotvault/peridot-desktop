import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import { isDesktopRuntime, showLoginWindow, showMainWindow } from '@shared/desktop/windowControls';

export type StartupStage = 'updater' | 'login' | 'app';

export interface StartupStageContextValue {
  stage: StartupStage;
  goToLogin: () => void;
  goToApp: () => void;
  goToUpdater: () => void;
}

export const StartupStageContext = createContext<StartupStageContextValue | undefined>(undefined);

export function useStartupStage() {
  const context = useContext(StartupStageContext);
  if (!context) {
    throw new Error('useStartupStage must be used within StartupStageProvider');
  }
  return context;
}

type StageProviderProps = {
  stage: StartupStage;
  children: ReactNode;
  onGoToLogin?: () => void;
  onGoToApp?: () => void;
  onGoToUpdater?: () => void;
};

export function StartupStageProvider({
  stage,
  children,
  onGoToLogin,
  onGoToApp,
  onGoToUpdater,
}: StageProviderProps) {
  const goToLogin = useCallback(() => {
    if (onGoToLogin) {
      onGoToLogin();
      return;
    }
    if (isDesktopRuntime()) {
      void showLoginWindow('login');
    } else if (typeof window !== 'undefined') {
      window.location.assign('/login.html');
    }
  }, [onGoToLogin]);

  const goToApp = useCallback(() => {
    if (onGoToApp) {
      onGoToApp();
      return;
    }
    if (isDesktopRuntime()) {
      void showMainWindow();
    } else if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  }, [onGoToApp]);

  const goToUpdater = useCallback(() => {
    if (onGoToUpdater) {
      onGoToUpdater();
      return;
    }
    if (isDesktopRuntime()) {
      void showLoginWindow('updater');
    } else if (typeof window !== 'undefined') {
      window.location.assign('/login.html#/updater');
    }
  }, [onGoToUpdater]);

  const value = useMemo(
    () => ({
      stage,
      goToLogin,
      goToApp,
      goToUpdater,
    }),
    [stage, goToLogin, goToApp, goToUpdater],
  );

  return <StartupStageContext.Provider value={value}>{children}</StartupStageContext.Provider>;
}
