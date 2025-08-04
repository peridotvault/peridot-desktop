/**
 * Convert hex string to ArrayBuffer
 * @param hex Hexadecimal string
 * @returns ArrayBuffer
 */

export function hexToArrayBuffer(hex: string): ArrayBuffer {
  // Pastikan panjang string genap
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  const uint8Array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    uint8Array[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return uint8Array.buffer;
}

export function forceToArrayBuffer(uint8: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(uint8.length);
  const view = new Uint8Array(buffer);
  view.set(uint8);
  return buffer;
}
