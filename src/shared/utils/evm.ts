import { mnemonicToSeedSync } from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/curves/abstract/utils';

const bip32 = BIP32Factory(ecc);

export function deriveEvmAddressFromSeed(mnemonic: string): string {
    const seed = mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    
    // Standard Ethereum derivation path: m/44'/60'/0'/0/0
    const child = root.derivePath("m/44'/60'/0'/0/0");
    
    if (!child.privateKey) {
        throw new Error('Failed to derive private key');
    }

    // Get public key from private key
    const publicKey = ecc.pointFromScalar(child.privateKey, false);
    if (!publicKey) {
        throw new Error('Failed to derive public key');
    }

    // Skip the first byte (0x04 prefix for uncompressed public key)
    const publicKeyWithoutPrefix = publicKey.slice(1);
    
    // Keccak-256 hash of the public key
    const hash = keccak_256(publicKeyWithoutPrefix);
    
    // The address is the last 20 bytes of the hash
    const addressBytes = hash.slice(-20);
    
    return `0x${bytesToHex(addressBytes)}`;
}
