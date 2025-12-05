import { fetch } from '@tauri-apps/plugin-http';
import { mkdir, writeFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

export type DownloadProgressHandler = (downloaded: number, totalBytes?: number) => void;

export interface DownloadFileParams {
  url: string;
  destinationDir: string;
  fileName: string;
  onProgress?: DownloadProgressHandler;
}

export interface DownloadResult {
  filePath: string;
  totalBytes?: number;
}

export async function downloadFile({
  url,
  destinationDir,
  fileName,
  onProgress,
}: DownloadFileParams): Promise<DownloadResult> {
  const filePath = await join(destinationDir, fileName);
  await mkdir(destinationDir, { recursive: true });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download (${response.status} ${response.statusText})`);
  }

  const totalHeader = typeof response.headers?.get === 'function'
    ? response.headers.get('content-length')
    : null;
  const total = totalHeader ? Number(totalHeader) : undefined;

  if (response.body && typeof (response.body as ReadableStream<Uint8Array>).getReader === 'function') {
    const reader = (response.body as ReadableStream<Uint8Array>).getReader();
    let downloaded = 0;

    const trackedStream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        if (value) {
          downloaded += value.byteLength;
          onProgress?.(downloaded, total);
          controller.enqueue(value);
        }
      },
    });

    await writeFile(filePath, trackedStream, { create: true });
    onProgress?.(downloaded, total ?? downloaded);
    return { filePath, totalBytes: total ?? downloaded };
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  onProgress?.(buffer.byteLength, buffer.byteLength);
  await writeFile(filePath, buffer, { create: true });

  return { filePath, totalBytes: buffer.byteLength };
}
