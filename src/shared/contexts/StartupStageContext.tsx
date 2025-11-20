import { createContext, useContext } from 'react';

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
    throw new Error('useStartupStage must be used within StartupFlow');
  }
  return context;
}
