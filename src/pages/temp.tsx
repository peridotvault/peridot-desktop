import { useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { BIP32Factory } from "bip32";
import { Principal } from "@dfinity/principal";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Buffer } from "buffer";

import * as ecc from "tiny-secp256k1";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const bip32 = BIP32Factory(ecc);

interface Wallet {
  identity: Secp256k1KeyIdentity | null;
  seedPhrase: string | null;
  principalId: string | null;
  accountId: string | null;
  privateKey: string | null;
  password: string | null;
}

export default function CreateWallet() {
  const [wallet, setWallet] = useState<Wallet>({
    identity: null,
    seedPhrase: generateMnemonic(),
    principalId: null,
    accountId: null,
    privateKey: null,
    password: null,
  });
  const [isGeneratedSeedPhrase, setIsGeneratedSeedPhrase] = useState(false);
  const [isPasswordCreated, setIsPasswordCreated] = useState(false);

  const generateSeedPhrase = () => {
    const seedPhrase = generateMnemonic();
    setWallet((prevWallet) => ({
      ...prevWallet,
      seedPhrase: seedPhrase,
    }));
  };

  const generateWallet = (seedPhrase: string) => {
    try {
      // Convert mnemonic to seed
      const seed = mnemonicToSeedSync(seedPhrase);

      // Derive key pair from seed using BIP32
      const root = bip32.fromSeed(seed);
      const child = root.derivePath("m/44'/223'/0'/0/0");

      // Create identity from derived private key
      if (!child.privateKey) {
        throw new Error("Private key is undefined");
      }
      const identity = Secp256k1KeyIdentity.fromSecretKey(child.privateKey);
      const principalId = identity.getPrincipal().toString();
      const accountId = generateAccountId(identity.getPrincipal().toString());

      // Get private key
      const privateKey = Buffer.from(identity.getKeyPair().secretKey).toString(
        "hex"
      );

      // Update wallet state
      setWallet((prevWallet) => ({
        ...prevWallet,
        identity: identity,
        seedPhrase: seedPhrase,
        principalId: principalId,
        accountId: accountId,
        privateKey: privateKey,
      }));

      return {
        success: true,
        identity: identity,
        seedPhrase: seedPhrase,
        principalId: principalId,
        privateKey: privateKey,
        accountId: accountId,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  };

  const generateAccountId = (principalId: string): string => {
    const principal = Principal.fromText(principalId);
    const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });
    return accountIdentifier.toHex();
  };

  if (!isPasswordCreated) {
    if (!isGeneratedSeedPhrase) {
      return (
        <main className="flex justify-center items-center p-6 flex-col gap-5">
          <p>Generate Your Wallet</p>
          <button
            className="border p-3 w-[300px] text-lg"
            onClick={generateSeedPhrase}
          >
            {wallet.seedPhrase && <p>{wallet.seedPhrase}</p>}
          </button>
          <button
            onClick={() => {
              setIsGeneratedSeedPhrase(true);
            }}
            className="bg-white text-black py-2 px-5 rounded-full"
          >
            Continue
          </button>
        </main>
      );
    } else {
      return (
        <main className="flex justify-center items-center p-6 flex-col gap-5">
          <p>Create Password</p>
          <input
            type="password"
            name="password"
            className="border p-2 rounded text-black"
            placeholder="Enter your password"
            value={!wallet.password ? "" : wallet.password}
            onChange={(e) =>
              setWallet((prevWallet) => ({
                ...prevWallet,
                password: e.target.value,
              }))
            }
          />
          <button
            onClick={() => {
              if (wallet.seedPhrase) {
                setIsPasswordCreated(true);
                generateWallet(wallet.seedPhrase);
              }
            }}
            className="bg-white text-black py-2 px-5 rounded-full"
          >
            Create Password
          </button>
        </main>
      );
    }
  }

  return (
    <main>
      <p>wallet.identity : {wallet.identity?.toString()}</p>
      <p>wallet.seedPhrase : {wallet.seedPhrase}</p>
      <p>wallet.principalId : {wallet.principalId}</p>
      <p> wallet.accountId : {wallet.accountId}</p>
      <p>wallet.privateKey : {wallet.privateKey}</p>
      <p>wallet.password : {wallet.password}</p>
    </main>
  );
}
