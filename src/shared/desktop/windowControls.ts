import type { StartupStage } from '../contexts/StartupStageContext';
import { invoke } from '@tauri-apps/api/core';

export type WindowRole = 'login' | 'main' | 'web';
type LoginWindowStage = Extract<StartupStage, 'updater' | 'login'>;

const TAURI_METADATA_KEYS = ['__TAURI_METADATA__', '__TAURI_INTERNALS__'];
const LEGACY_LOGIN_LABEL = 'launcher';
const LOGIN_LABEL = 'login';

const isLoginLabel = (label?: string | null) =>
  label === LOGIN_LABEL || label === LEGACY_LOGIN_LABEL;

export const isDesktopRuntime = () => {
  if (typeof window === 'undefined') return false;
  // Tauri v2 exposes __TAURI_INTERNALS__ (metadata) & __TAURI__ bridge
  return Boolean((window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__);
};

const readLabelFromMetadata = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  for (const key of TAURI_METADATA_KEYS) {
    const meta = (window as any)[key]?.metadata ?? (window as any)[key];
    const label: string | undefined = meta?.window?.label || meta?.windows?.[0]?.label;
    if (label) return label;
  }
  return undefined;
};

// Dipakai untuk initial windowRole (sync)
export const getWindowRole = (): WindowRole => {
  if (typeof window === 'undefined') {
    // SSR / node, anggap login
    return 'login';
  }
  if (!isDesktopRuntime()) {
    return 'web';
  }

  const label = readLabelFromMetadata();
  if (!label || isLoginLabel(label)) return 'login';
  return 'main';
};

// Versi async pakai API window Tauri (akurasi label)
export const resolveDesktopWindowRole = async (): Promise<WindowRole> => {
  if (!isDesktopRuntime()) {
    return 'web';
  }

  const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
  const currentWindow = getCurrentWebviewWindow();
  return isLoginLabel(currentWindow.label) ? 'login' : 'main';
};

// === Window control via Rust commands ===

// Buka main window + tutup login window (Rust yang urus)
export const showMainWindow = async () => {
  if (!isDesktopRuntime()) return;
  await invoke('open_main_window');
};

// Buka login window + tutup main window (Rust yang urus)
export const showLoginWindow = async (targetStage?: LoginWindowStage) => {
  if (!isDesktopRuntime()) return;
  await invoke('open_login_window', { stage: targetStage });
};

// Optional: sembunyikan window saat ini (kalau butuh)
export const hideCurrentWindow = async () => {
  if (!isDesktopRuntime()) return;
  const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
  const currentWindow = getCurrentWebviewWindow();
  await currentWindow.hide();
};

// Sinkronisasi stage login window via event (boleh no-op dulu)
export const listenLoginWindowStageChange = async (
  _handler: (stage: LoginWindowStage) => void,
) => {
  if (!isDesktopRuntime()) return undefined;

  // Kalau belum pakai event login-window:set-stage dari Rust,
  // bisa dikosongin dulu biar nggak error.
  return undefined;
};
