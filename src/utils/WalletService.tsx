// wallet.ts
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { BIP32Factory } from "bip32";
import { Principal } from "@dfinity/principal";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Buffer } from "buffer";
import * as ecc from "tiny-secp256k1";
import { createEncryptionService, EncryptedData } from "@antigane/encryption";

const bip32 = BIP32Factory(ecc);

export interface WalletData {
  encryptedSeedPhrase: EncryptedData | null;
  principalId: string | null;
  accountId: string | null;
  encryptedPrivateKey: EncryptedData | null;
  verificationData: EncryptedData | null;
  lock: OpenLockConfig | null;
}

export interface WalletGenerateSuccess {
  success: true;
  encryptedSeedPhrase: EncryptedData;
  principalId: string;
  encryptedPrivateKey: EncryptedData;
  accountId: string;
  verificationData: EncryptedData;
}

export interface WalletGenerateError {
  success: false;
  error: string;
}

export interface AESEncrypted {
  iv: string;
  encryptedData: string;
}

export interface OpenLockConfig {
  expiresAt: number;
  encryptedPassword: AESEncrypted;
}

// Get encryption key from environment variable
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not set in environment variables");
}

async function encryptPassword(password: string): Promise<AESEncrypted> {
  try {
    // Convert encryption key to proper format
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(ENCRYPTION_KEY),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive an AES-GCM key using PBKDF2
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    // Encrypt the password
    const encodedPassword = new TextEncoder().encode(password);
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedPassword
    );

    // Convert to base64 for storage
    return {
      iv: Buffer.from(iv).toString("base64"),
      encryptedData: Buffer.from(encryptedData).toString("base64"),
    };
  } catch (error) {
    console.error("Error encrypting password:", error);
    throw new Error("Failed to encrypt password");
  }
}

async function decryptPassword(encrypted: AESEncrypted): Promise<string> {
  try {
    // Convert encryption key to proper format
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(ENCRYPTION_KEY),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // Derive the same key using PBKDF2
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Convert data from base64
    const iv = Buffer.from(encrypted.iv, "base64");
    const encryptedData = Buffer.from(encrypted.encryptedData, "base64");

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedData
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("Error decrypting password:", error);
    throw new Error("Failed to decrypt password");
  }
}

export type WalletGenerateResult = WalletGenerateSuccess | WalletGenerateError;

class WalletService {
  private encryption = createEncryptionService();
  // private lock: OpenLockConfig | null = null;

  async generateWallet(
    seedPhrase: string,
    password: string
  ): Promise<WalletGenerateResult> {
    try {
      const seed = mnemonicToSeedSync(seedPhrase);
      const root = bip32.fromSeed(seed);
      const child = root.derivePath("m/44'/223'/0'/0/0");

      if (!child.privateKey) {
        throw new Error("Private key is undefined");
      }

      const identity = Secp256k1KeyIdentity.fromSecretKey(child.privateKey);
      const principalId = identity.getPrincipal().toString();
      const accountId = this.generateAccountId(principalId);
      const privateKey = Buffer.from(identity.getKeyPair().secretKey).toString(
        "hex"
      );

      // Create verification data for lock checks
      const verificationData = await this.encryption.encrypt(
        "VERIFY",
        password
      );

      const encryptedSeedPhrase = await this.encryption.encrypt(
        seedPhrase,
        password
      );
      const encryptedPrivateKey = await this.encryption.encrypt(
        privateKey,
        password
      );

      return {
        success: true,
        encryptedSeedPhrase,
        principalId,
        encryptedPrivateKey,
        accountId,
        verificationData,
      };
    } catch (error) {
      console.error("Wallet generation error:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async openLock(
    password: string,
    verificationData: EncryptedData,
    minutes: number = 30
  ): Promise<OpenLockConfig> {
    try {
      // Verify password by attempting to decrypt verification data
      try {
        const decrypted = await this.encryption.decrypt(
          verificationData,
          password
        );
        if (decrypted !== "VERIFY") {
          throw new Error("Invalid password");
        }
      } catch (error) {
        throw new Error("Invalid password");
      }

      // Encrypt the password using AES
      const encryptedPassword = await encryptPassword(password);

      // Create new lock with expiration
      const lock: OpenLockConfig = {
        expiresAt: Date.now() + minutes * 60 * 1000,
        encryptedPassword: encryptedPassword,
      };

      localStorage.setItem("key-lock", JSON.stringify(lock));

      return lock;
    } catch (error) {
      throw new Error("Failed to open lock: " + (error as Error).message);
    }
  }

  async decryptWalletData(
    encryptedData: EncryptedData,
    password?: string
  ): Promise<string> {
    try {
      const lock = JSON.parse(localStorage.getItem("key-lock")!);
      if (this.isLockOpen() && lock?.encryptedPassword) {
        // Decrypt the stored password and use it
        const decryptedPassword = await decryptPassword(lock.encryptedPassword);
        return await this.encryption.decrypt(encryptedData, decryptedPassword);
      } else if (!password) {
        throw new Error("Password required when lock is not open");
      }
      return await this.encryption.decrypt(encryptedData, password);
    } catch (error) {
      throw new Error("Decryption error:" + (error as Error).message);
    }
  }

  isLockOpen(): Boolean {
    const lock = JSON.parse(localStorage.getItem("key-lock")!);
    return !!(lock && Date.now() <= lock.expiresAt);
  }

  closeLock(): Boolean {
    localStorage.removeItem("key-lock");
    return true;
  }

  setLock(lock: OpenLockConfig | null) {
    localStorage.setItem("key-lock", JSON.stringify(lock));
  }

  getLock(): OpenLockConfig | null {
    const lock = JSON.parse(localStorage.getItem("key-lock")!);
    return lock;
  }

  generateAccountId(principalId: string): string {
    const principal = Principal.fromText(principalId);
    const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });
    return accountIdentifier.toHex();
  }

  generateNewSeedPhrase(): string {
    return generateMnemonic();
  }
}

export const walletService = new WalletService();
