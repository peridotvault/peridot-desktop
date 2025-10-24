import {
  API_BASE_STORAGE,
  initAppStorage,
  safeFileName,
  uploadToPrefix,
} from '../../api/wasabiClient';

export async function handleAssetChange({
  file,
  fileNameBase,
  gameId,
}: {
  file: File;
  fileNameBase?: string;
  gameId: string;
}): Promise<string | undefined> {
  try {
    const storage = await initAppStorage(gameId);

    let fileName: string;
    if (fileNameBase && gameId) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const safeGameId = gameId.replace(/[^a-zA-Z0-9._-]/g, '_');
      fileName = `${safeGameId}-${fileNameBase}.${ext}`;
    } else {
      fileName = safeFileName(file.name);
    }

    const { key } = await uploadToPrefix({
      file,
      prefix: storage.prefixes.assets,
      fileName,
      contentType: file.type,
    });

    return `${API_BASE_STORAGE}/files/${key}`;
  } catch (err) {
    console.error('upload assets failed:', err);
  }
}
