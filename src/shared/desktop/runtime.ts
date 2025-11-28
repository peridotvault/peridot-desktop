export const isTauriRuntime = (): boolean => {
    if (typeof window === 'undefined') return false;
    const w = window as any;
    return '__TAURI_IPC__' in w || '__TAURI_INTERNALS__' in w || '__TAURI__' in w;
};

export type CurrentWebviewWindow = Awaited<
    ReturnType<typeof import('@tauri-apps/api/webviewWindow')['getCurrentWebviewWindow']>
>;

export const getCurrentWebviewWindowSafe = async (): Promise<CurrentWebviewWindow | null> => {
    if (!isTauriRuntime()) {
        return null;
    }

    try {
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
        return getCurrentWebviewWindow();
    } catch (error) {
        console.warn('[runtime] Failed to acquire current webview window', error);
        return null;
    }
};