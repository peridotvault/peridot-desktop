import { open } from '@tauri-apps/plugin-dialog';

export async function selectInstallDirectory(): Promise<string | null> {
  try {
    const result = (await open({
      directory: true,
      multiple: false,
    })) as string | string[] | null;

    if (typeof result === 'string') return result;
    if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'string') {
      return result[0];
    }
    return null;
  } catch (error) {
    console.error('[download] failed to open directory picker', error);
    return null;
  }
}
