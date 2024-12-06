import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { BIP32Factory } from "bip32";
import { Principal } from "@dfinity/principal";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Buffer } from "buffer";
import * as ecc from "tiny-secp256k1";

const bip32 = BIP32Factory(ecc);

export interface WalletData {
  seedPhrase: string | null;
  principalId: string | null;
  accountId: string | null;
  privateKey: string | null;
  password: string | null;
}

export interface SerializedWalletData {
  seedPhrase: string | null;
  principalId: string | null;
  accountId: string | null;
  privateKey: string | null;
  password: string | null;
}

export interface StoreSchema {
  wallet: SerializedWalletData;
}

export interface WalletGenerateSuccess {
  success: true;
  seedPhrase: string;
  principalId: string;
  privateKey: string;
  accountId: string;
}

export interface WalletGenerateError {
  success: false;
  error: string;
}

export type WalletGenerateResult = WalletGenerateSuccess | WalletGenerateError;

class WalletService {
  generateWallet(seedPhrase: string): WalletGenerateResult {
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

      return {
        success: true,
        seedPhrase,
        principalId,
        privateKey,
        accountId,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
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
