import { useEffect, useState, useCallback } from 'react';
import Dexie from 'dexie';
import { useWallet } from '@shared/contexts/WalletContext';
import { walletService } from '@shared/services/wallet';
import { deriveEvmAddressFromSeed } from '@shared/utils/evm';
import { deriveSvmAddressFromSeed } from '@shared/utils/solana';
import { getMyGamesEvm } from '@shared/blockchain/evm/services/game';
import { getMyGamesSvm } from '@shared/blockchain/solana/services/game';
import { libraryService } from '../services/localDb';
import type { LibraryEntry } from '@shared/interfaces/library';
import type { PGCGame } from '@shared/interfaces/game';

export type RealLibraryGame = {
  gameId: string;
  name: string;
  description: string;
  coverVerticalImage: string;
  bannerImage: string;
  status: 'owned' | 'installed' | 'installing';
  localEntry?: LibraryEntry;
  remoteData?: PGCGame;
};

export function useMyGames() {
  const { wallet } = useWallet();
  const [games, setGames] = useState<RealLibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const fetchGames = useCallback(async () => {
    if (!wallet) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let seedPhrase: string | null = null;

      // 1. Get seed phrase
      if (wallet.runtimeWallet?.secret?.seedPhrase) {
        seedPhrase = wallet.runtimeWallet.secret.seedPhrase;
      } else if (wallet.encryptedSeedPhrase) {
        const isLockOpen = await walletService.isLockOpen();
        if (isLockOpen) {
          seedPhrase = await walletService.decryptWalletData(wallet.encryptedSeedPhrase);
        }
      }

      if (!seedPhrase) {
        setLoading(false);
        return;
      }

      // 2. Get addresses from runtime database
      let evmAddress: string | null = null;
      let svmAddress: string | null = null;

      try {
        // The runtime maintains the active public keys in Dexie
        const db = new Dexie('peridotwallet');
        db.version(3).stores({
          accounts: '++id, kind, publicKey, updatedAt',
        });

        const evmAcc = await db.table('accounts').where('kind').equals('evm').first();
        const svmAcc = await db.table('accounts').where('kind').equals('svm').first();

        if (evmAcc) evmAddress = evmAcc.publicKey;
        if (svmAcc) svmAddress = svmAcc.publicKey;

        db.close();
      } catch (dbErr) {
        console.warn('[useMyGames] Failed to query runtime DB, falling back to derivation:', dbErr);
      }

      // Fallback if DB is empty or missing
      if (!evmAddress) evmAddress = deriveEvmAddressFromSeed(seedPhrase);
      if (!svmAddress) svmAddress = deriveSvmAddressFromSeed(seedPhrase);

      // 3. Fetch from blockchains
      const [evmGames, svmGames, localEntries] = await Promise.all([
        getMyGamesEvm({ address: evmAddress }),
        getMyGamesSvm({ address: svmAddress }),
        libraryService.getAll(),
      ]);

      // 4. Merge results
      const remoteGames = [...evmGames, ...svmGames];
      const mergedMap = new Map<string, RealLibraryGame>();

      // Process remote games first (filter out games with no valid name)
      for (const remote of remoteGames) {
        // Skip games with unknown or empty names
        if (!remote.name || remote.name === 'Unknown Game') {
          console.warn(`[useMyGames] Skipping game with invalid name:`, remote.gameId);
          continue;
        }

        mergedMap.set(remote.gameId, {
          gameId: remote.gameId,
          name: remote.name,
          description: remote.description,
          coverVerticalImage: remote.coverVerticalImage || '',
          bannerImage: remote.bannerImage || '',
          status: 'owned',
          remoteData: remote,
        });
      }

      // Process local entries (installed/etc)
      for (const local of localEntries) {
        const existing = mergedMap.get(local.gameId);
        if (existing) {
          existing.status = local.status as any; // installed, installing, etc
          existing.localEntry = local;
          // Prefer local images if available (cached)
          if (local.coverVerticalImage) existing.coverVerticalImage = local.coverVerticalImage;
          if (local.bannerImage) existing.bannerImage = local.bannerImage;
        } else {
          // Game is in local DB but not found on blockchain?
          // This could be default games or sideloaded ones
          mergedMap.set(local.gameId, {
            gameId: local.gameId,
            name: local.gameName,
            description: local.description,
            coverVerticalImage: local.coverVerticalImage,
            bannerImage: local.bannerImage,
            status: local.status as any,
            localEntry: local,
          });
        }
      }

      console.log('games: ', Array.from(mergedMap.values()));
      setGames(Array.from(mergedMap.values()));
    } catch (err) {
      console.error('[useMyGames] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [wallet, nonce]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    isEmpty: !loading && games.length === 0,
    reload: () => setNonce((n) => n + 1),
  };
}
