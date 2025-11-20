import type { StartupStage } from '../contexts/StartupStageContext';

export type WindowRole = 'login' | 'main' | 'web';
type LoginWindowStage = Extract<StartupStage, 'updater' | 'login'>;

const TAURI_METADATA_KEY = '__TAURI_METADATA__';
const LEGACY_LOGIN_LABEL = 'launcher';
const LOGIN_LABEL = 'login';

const isLoginLabel = (label?: string | null) =>
  label === LOGIN_LABEL || label === LEGACY_LOGIN_LABEL;

export const isDesktopRuntime = () =>
  typeof window !== 'undefined' && Boolean((window as any).__TAURI__);

export const getWindowRole = (): WindowRole => {
  if (typeof window === 'undefined') {
    return 'login';
  }
  if (!isDesktopRuntime()) {
    return 'web';
  }
  const metadata = (window as any)[TAURI_METADATA_KEY];
  const label: string | undefined = metadata?.window?.label || metadata?.windows?.[0]?.label;
  if (!label || isLoginLabel(label)) {
    return 'login';
  }
  return 'main';
};

const loadWindowApi = async () => import('@tauri-apps/api/window');
const loadWebviewWindowApi = async () => import('@tauri-apps/api/webviewWindow');
const loadEventApi = async () => import('@tauri-apps/api/event');

export const resolveDesktopWindowRole = async (): Promise<WindowRole> => {
  if (!isDesktopRuntime()) {
    return 'web';
  }
  const { getCurrentWindow } = await loadWindowApi();
  const currentWindow = getCurrentWindow();
  return isLoginLabel(currentWindow.label) ? 'login' : 'main';
};

const getCurrentWindowHandle = async () => {
  const { getCurrentWindow } = await loadWindowApi();
  return getCurrentWindow();
};

export const showMainWindow = async () => {
  if (!isDesktopRuntime()) return;
  const { WebviewWindow } = await loadWebviewWindowApi();
  let main = await WebviewWindow.getByLabel('main');
  if (!main) {
    main = new WebviewWindow('main');
  }
  await main.show();
  await main.setFocus();
  const currentWindow = await getCurrentWindowHandle();
  if (isLoginLabel(currentWindow.label)) {
    await currentWindow.hide();
  }
};

export const showLoginWindow = async (targetStage?: LoginWindowStage) => {
  if (!isDesktopRuntime()) return;
  const { WebviewWindow } = await loadWebviewWindowApi();
  let loginWindow = await WebviewWindow.getByLabel(LOGIN_LABEL);
  if (!loginWindow) {
    loginWindow = await WebviewWindow.getByLabel(LEGACY_LOGIN_LABEL);
  }
  if (!loginWindow) {
    loginWindow = new WebviewWindow(LOGIN_LABEL);
  }
  if (targetStage) {
    await loginWindow.emit('login-window:set-stage', targetStage);
  }
  await loginWindow.show();
  await loginWindow.setFocus();
  const currentWindow = await getCurrentWindowHandle();
  if (currentWindow.label === 'main') {
    await currentWindow.hide();
  }
};

export const hideCurrentWindow = async () => {
  if (!isDesktopRuntime()) return;
  const currentWindow = await getCurrentWindowHandle();
  await currentWindow.hide();
};

export const listenLoginWindowStageChange = async (
  handler: (stage: LoginWindowStage) => void,
) => {
  if (!isDesktopRuntime()) return undefined;
  const { listen } = await loadEventApi();
  const unlisten = await listen<LoginWindowStage>('login-window:set-stage', (event) => {
    handler(event.payload);
  });
  return unlisten;
};
