// src/features/library/utils/imageCompression.ts

export interface CompressOptions {
    maxWidth: number;
    maxHeight: number;
    quality?: number; // 0..1
    mimeType?: string; // "image/jpeg" | "image/png"
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // kalau perlu untuk asset di domain lain
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
    });
}

/**
 * Download + compress image ke data URL (string).
 */
export async function downloadAndCompressToDataUrl(
    url: string,
    options: CompressOptions
): Promise<string> {
    const {
        maxWidth,
        maxHeight,
        quality = 0.8,
        mimeType = "image/jpeg",
    } = options;

    const img = await loadImage(url);

    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    const widthRatio = maxWidth / origWidth;
    const heightRatio = maxHeight / origHeight;
    const ratio = Math.min(widthRatio, heightRatio, 1); // jangan upscale

    const targetWidth = Math.round(origWidth * ratio);
    const targetHeight = Math.round(origHeight * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const dataUrl = canvas.toDataURL(mimeType, quality);
    // contoh: "data:image/jpeg;base64,..."
    return dataUrl;
}

/**
 * Fallback 1x1 transparan (data URL) kalau semua gagal.
 */
export function createEmptyImageDataUrl(): string {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.clearRect(0, 0, 1, 1);
    }
    return canvas.toDataURL("image/png");
}
