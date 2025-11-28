import { getCurrentWebviewWindowSafe, isTauriRuntime } from './runtime';

type LoginWindowStage = 'updater' | 'login';

export const isDesktopRuntime = () => isTauriRuntime();

// Buka main window + tutup login window (Rust yang urus)
export const showMainWindow = async () => {
  if (!isDesktopRuntime()) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('open_main_window');
  } catch (error) {
    console.warn('[windowControls] Failed to open main window', error);
  }
};

// Buka login window + tutup main window (Rust yang urus)
export const showLoginWindow = async (targetStage?: LoginWindowStage) => {
  if (!isDesktopRuntime()) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('open_login_window', { stage: targetStage });
  } catch (error) {
    console.warn('[windowControls] Failed to open login window', error);
  }
};

// Optional: sembunyikan window saat ini (kalau butuh)
export const hideCurrentWindow = async () => {
  if (!isDesktopRuntime()) return;
  const currentWindow = await getCurrentWebviewWindowSafe();
  await currentWindow?.hide();
};

export const redirectToLogin = (stage: LoginWindowStage = 'login') => {
  if (isDesktopRuntime()) {
    void showLoginWindow(stage);
    return;
  }
  if (typeof window !== 'undefined') {
    const hash = stage === 'updater' ? '#/updater' : '';
    window.location.assign(`/login.html${hash}`);
  }
};

export const redirectToMain = () => {
  if (isDesktopRuntime()) {
    void showMainWindow();
    return;
  }
  if (typeof window !== 'undefined') {
    window.location.assign('/');
  }
};
