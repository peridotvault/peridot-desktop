import { Buffer } from 'buffer';

export interface EncryptedData {
  iv: string;
  salt: string;
  data: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const PBKDF2_ITERATIONS = 150000;
const AES_KEY_LENGTH = 256;

function getRandomBytes(size: number): Uint8Array {
  const buffer = new Uint8Array(size);
  crypto.getRandomValues(buffer);
  return buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptString(value: string, password: string): Promise<EncryptedData> {
  const iv = getRandomBytes(12);
  const salt = getRandomBytes(16);
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(value),
  );

  return {
    iv: Buffer.from(iv).toString('base64'),
    salt: Buffer.from(salt).toString('base64'),
    data: Buffer.from(new Uint8Array(ciphertext)).toString('base64'),
  };
}

export async function decryptString(payload: EncryptedData, password: string): Promise<string> {
  const iv = Buffer.from(payload.iv, 'base64');
  const salt = Buffer.from(payload.salt, 'base64');
  const data = Buffer.from(payload.data, 'base64');
  const key = await deriveKey(password, new Uint8Array(salt));
  const plainBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    data,
  );
  return decoder.decode(plainBuffer);
}
