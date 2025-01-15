// wallet.ts
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { BIP32Factory } from "bip32";
import { Principal } from "@dfinity/principal";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Buffer } from "buffer";
import * as ecc from "tiny-secp256k1";
import { createEncryptionService, EncryptedData } from "./AntiganeEncrypt";

const bip32 = BIP32Factory(ecc);

export interface WalletData {
  encryptedSeedPhrase: EncryptedData | null;
  principalId: string | null;
  accountId: string | null;
  encryptedPrivateKey: EncryptedData | null;
}

export interface WalletGenerateSuccess {
  success: true;
  encryptedSeedPhrase: EncryptedData;
  principalId: string;
  encryptedPrivateKey: EncryptedData;
  accountId: string;
}

export interface WalletGenerateError {
  success: false;
  error: string;
}

export type WalletGenerateResult = WalletGenerateSuccess | WalletGenerateError;

class WalletService {
  // Use larger parameters for better security
  private encryption = createEncryptionService();

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

      // Encrypt with better security using hash-based s vector
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
      };
    } catch (error) {
      console.error("Wallet generation error:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async decryptWalletData(
    encryptedData: EncryptedData,
    password: string
  ): Promise<string> {
    try {
      return await this.encryption.decrypt(encryptedData, password);
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt data. Please check your password.");
    }
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
